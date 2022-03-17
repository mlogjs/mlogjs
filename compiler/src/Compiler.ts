import { parse } from "@babel/parser";
import * as handlers from "./handlers";
import { initScope } from "./initScope";
import { EndInstruction } from "./instructions";
import { Scope } from "./Scope";
import { es, IScope, IValue, THandler, TValueInstructions } from "./types";

type THandlerMap = { [k in es.Node["type"]]?: THandler<IValue | null> };

export class Compiler {
  protected stackName?: string;
  protected usingStack: boolean;
  protected handlers: THandlerMap = handlers;

  constructor(stackName?: string) {
    this.usingStack = !!stackName;
    this.stackName = stackName;
  }

  compile(
    script: string
  ): [string, null, es.Node[]] | [null, Error, es.Node[]] {
    let output: string;
    try {
      const program = this.parse(script);
      const scope = new Scope({});

      initScope(scope);

      const valueInst = this.handle(scope, program);
      valueInst[1].push(new EndInstruction(), ...scope.inst);
      this.resolve(valueInst);
      output = this.serialize(valueInst) + "\n";
    } catch (error: any) {
      return [null, error, error?.nodeStack ?? []];
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
    const [_, inst] = resLines;
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
      if (!handler) throw Error("Missing handler for " + node.type);
      return handler(this, scope, node, null);
    } catch (error: any) {
      error.nodeStack ??= [];
      error.nodeStack.push(node);
      throw error;
    }
  }

  handleEval(scope: IScope, node: es.Node): TValueInstructions {
    const [res, inst] = this.handle(scope, node);
    const [evaluated, evaluatedLines] = res!.eval(scope);
    return [evaluated, [...inst, ...evaluatedLines]];
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
      const [_, nodeLines] = handler(scope, node);
      lines.push(...nodeLines);
    }
    return [null, lines];
  }
}
