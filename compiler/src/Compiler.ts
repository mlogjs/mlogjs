import { parse } from "@babel/parser";
import { CompilerError } from "./CompilerError";
import * as handlers from "./handlers";
import { initScope } from "./initScope";
import { EndInstruction } from "./instructions";
import { Scope } from "./Scope";
import { es, IScope, IValue, THandler, TValueInstructions } from "./types";
import { ValueOwner } from "./values/ValueOwner";
import { createTemp } from "./utils";

type THandlerMap = { [k in es.Node["type"]]?: THandler<IValue | null> };

export interface CompilerOptions {
  stackName?: string;

  /** Wether the compiler should preserve or compact variable and function names*/
  compactNames?: boolean;
}

export class Compiler {
  protected stackName: string;
  protected handlers: THandlerMap = handlers;
  readonly compactNames: boolean;

  constructor({ stackName, compactNames = false }: CompilerOptions = {}) {
    this.stackName = stackName ?? "bank1";
    this.compactNames = compactNames;
  }

  compile(
    script: string
  ): [string, null, es.Node[]] | [null, Error | CompilerError, es.Node[]] {
    let output: string;
    try {
      const program = this.parse(script);
      const scope = new Scope({});

      initScope(scope);

      scope.stackMemory = new ValueOwner({
        scope,
        value: createTemp(scope),
        name: this.stackName,
      }).value;
      scope.stackPointer = new ValueOwner({
        scope,
        value: createTemp(scope),
        name: this.stackName + ":sp",
      }).value;
      scope.stackFrame = new ValueOwner({
        scope,
        value: createTemp(scope),
        name: this.stackName + ":sf",
      }).value;

      const valueInst = this.handle(scope, program);
      valueInst[1].push(
        new EndInstruction(),
        ...scope.functions
          .filter(f => f.bundled)
          .map(f => f.inst)
          .reduce((flat, inst) => flat.concat(inst), [])
      );
      this.resolve(valueInst);
      output = this.serialize(valueInst) + "\n";
    } catch (error) {
      const nodeStack = error instanceof CompilerError ? error.nodeStack : [];
      return [null, error as Error, nodeStack];
    }
    return [output, null, []];
  }

  protected resolve(valueInst: TValueInstructions<IValue | null>) {
    let i = 0;
    for (const inst of valueInst[1]) {
      inst.resolve(i);
      if (!inst.hidden) i++;
    }
  }

  protected serialize(resLines: TValueInstructions<IValue | null>) {
    const [, inst] = resLines;
    return inst.filter(l => !l.hidden).join("\n");
  }

  protected parse(script: string) {
    return parse(script, {
      ranges: true,
      plugins: ["typescript"],
    });
  }

  handle(scope: IScope, node: es.Node): TValueInstructions<IValue | null> {
    try {
      const handler = this.handlers[node.type];
      if (!handler) throw new CompilerError("Missing handler for " + node.type);
      return handler(this, scope, node, null);
    } catch (error) {
      if (error instanceof CompilerError) {
        error.nodeStack.push(node);
      }
      throw error;
    }
  }

  handleEval(scope: IScope, node: es.Node): TValueInstructions {
    const [res, inst] = this.handle(scope, node);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [evaluated, evaluatedInst] = res!.eval(scope);
    return [evaluated, [...inst, ...evaluatedInst]];
  }

  handleConsume(scope: IScope, node: es.Node): TValueInstructions {
    const [res, inst] = this.handle(scope, node);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [evaluated, evaluatedInst] = res!.consume(scope);
    return [evaluated, [...inst, ...evaluatedInst]];
  }

  handleMany<T extends es.Node>(
    scope: IScope,
    nodes: T[],
    handler: (
      scope: IScope,
      node: T
    ) => TValueInstructions<IValue | null> = this.handle.bind(this)
  ): TValueInstructions<null> {
    const lines = [];
    for (const node of nodes) {
      const [, nodeLines] = handler(scope, node);
      lines.push(...nodeLines);
    }
    return [null, lines];
  }
}
