import { parse } from "@babel/parser";
import { CompilerError } from "./CompilerError";
import * as handlers from "./handlers";
import { initScope } from "./initScope";
import { AddressResolver, EndInstruction } from "./instructions";
import { Scope } from "./Scope";
import {
  es,
  IInstruction,
  IScope,
  IValue,
  TEOutput,
  THandler,
  TValueInstructions,
} from "./types";
import { appendSourceLocations, hideRedundantJumps, pipeInsts } from "./utils";

type THandlerMap = { [k in es.Node["type"]]?: THandler<IValue | null> };

export interface CompilerOptions {
  /** Wether the compiler should preserve or compact variable and function names*/
  compactNames?: boolean;

  sourcemap?: boolean;
}

export class Compiler {
  protected stackName?: string;
  protected handlers: THandlerMap = handlers;
  readonly compactNames: boolean;
  readonly sourcemap: boolean;

  constructor({
    compactNames = false,
    sourcemap = false,
  }: CompilerOptions = {}) {
    this.compactNames = compactNames;
    this.sourcemap = sourcemap;
  }

  compile(
    script: string
  ): [string, null, es.SourceLocation[] | undefined] | [null, CompilerError] {
    let output: string;
    let sourcemaps: es.SourceLocation[] | undefined;

    try {
      const program = this.parse(script);
      const scope = new Scope({});

      initScope(scope);

      const valueInst = this.handle(scope, program);
      if (needsEndInstruction(valueInst[1], scope)) {
        valueInst[1].push(new EndInstruction());
      }
      valueInst[1].push(...scope.inst);

      hideRedundantJumps(valueInst[1]);
      this.resolve(valueInst);
      output = this.serialize(valueInst) + "\n";
      if (this.sourcemap) {
        sourcemaps = this.mapSources(valueInst);
      }
    } catch (error) {
      const err =
        error instanceof CompilerError ? error : CompilerError.from(error);
      return [null, err];
    }
    return [output, null, sourcemaps];
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

  protected mapSources(
    valueInst: TValueInstructions<IValue | null>
  ): es.SourceLocation[] {
    const result: es.SourceLocation[] = [];

    for (const inst of valueInst[1]) {
      if (!inst.hidden) result.push(inst.source as es.SourceLocation);
    }

    return result;
  }

  handle(
    scope: IScope,
    node: es.Node,
    handler = this.handlers[node.type],
    out?: TEOutput
  ): TValueInstructions<IValue | null> {
    try {
      if (!handler) throw new CompilerError("Missing handler for " + node.type);
      const result = handler(this, scope, node, out, null);
      if (this.sourcemap) return appendSourceLocations(result, node);
      return result;
    } catch (error) {
      if (error instanceof CompilerError) {
        error.loc ??= node.loc as es.SourceLocation;
      }
      throw error;
    }
  }

  /** Handles the node and asserts that it resolves to a value. */
  handleValue(
    scope: IScope,
    node: es.Node,
    handler = this.handlers[node.type],
    out?: TEOutput
  ): TValueInstructions {
    const result = this.handle(scope, node, handler, out);
    if (!result[0])
      throw new CompilerError(
        `This node (${node.type}) did not return a value`,
        node
      );
    return result as TValueInstructions;
  }

  handleEval(scope: IScope, node: es.Node, out?: TEOutput): TValueInstructions {
    const [res, inst] = this.handleValue(scope, node, undefined, out);
    const [evaluated, evaluatedInst] = res.eval(scope, out);
    const result: TValueInstructions = [evaluated, [...inst, ...evaluatedInst]];

    if (this.sourcemap) return appendSourceLocations(result, node);
    return result;
  }

  /**
   * Handles many nodes in order.
   *
   * The usage of this method over a regular loop over an array of nodes
   * is only required if the code inside the loop generates
   * instructions that are not tracked by the compiler
   * handler methods ({@link handle}, {@link handleEval}
   * and {@link handleMany})
   *
   */
  handleMany<T extends es.Node>(
    scope: IScope,
    nodes: T[],
    handler?: (node: T) => TValueInstructions<IValue | null>
  ): TValueInstructions<null> {
    const lines: IInstruction[] = [];
    for (const node of hoistedFunctionNodes(nodes)) {
      pipeInsts(
        this.handle(scope, node, handler && (() => handler(node))),
        lines
      );
    }
    return [null, lines];
  }
}

function* hoistedFunctionNodes<T extends es.Node>(nodes: T[]) {
  // sorting is O(n long n) while this is just O(n)
  // besides, it's better not to modify the node array
  for (const node of nodes) {
    if (node.type === "FunctionDeclaration") {
      yield node;
    }
  }

  for (const node of nodes) {
    if (node.type !== "FunctionDeclaration") {
      yield node;
    }
  }
}

function needsEndInstruction(inst: IInstruction[], scope: IScope) {
  const last = inst[inst.length - 1];
  if (last instanceof AddressResolver) return true;
  return scope.inst.length > 0;
}
