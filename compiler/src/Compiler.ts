import { parse } from "@babel/parser";
import { CompilerError } from "./CompilerError";
import * as handlers from "./handlers";
import { initScope } from "./initScope";
import {
  AddressResolver,
  EndInstruction,
  JumpInstruction,
} from "./instructions";
import { Scope } from "./Scope";
import {
  es,
  IInstruction,
  IScope,
  IValue,
  THandler,
  TValueInstructions,
} from "./types";
import { appendSourceLocations } from "./utils";

type THandlerMap = { [k in es.Node["type"]]?: THandler<IValue | null> };

export interface CompilerOptions {
  stackName?: string;

  /** Wether the compiler should preserve or compact variable and function names*/
  compactNames?: boolean;

  sourcemap?: boolean;
}

export class Compiler {
  protected stackName?: string;
  protected usingStack: boolean;
  protected handlers: THandlerMap = handlers;
  readonly compactNames: boolean;
  readonly sourcemap: boolean;

  constructor({
    stackName,
    compactNames = false,
    sourcemap = false,
  }: CompilerOptions = {}) {
    this.usingStack = !!stackName;
    this.stackName = stackName;
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
      valueInst[1].push(new EndInstruction(), ...scope.inst);
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
    handler = this.handlers[node.type]
  ): TValueInstructions<IValue | null> {
    try {
      if (!handler) throw new CompilerError("Missing handler for " + node.type);
      const result = handler(this, scope, node, undefined, null);
      if (this.sourcemap) return appendSourceLocations(result, node);
      return result;
    } catch (error) {
      if (error instanceof CompilerError) {
        error.loc ??= node.loc as es.SourceLocation;
      }
      throw error;
    }
  }

  handleEval(scope: IScope, node: es.Node): TValueInstructions {
    const [res, inst] = this.handle(scope, node);

    if (!res) throw new CompilerError("Cannot eval null", node);

    const [evaluated, evaluatedInst] = res.eval(scope);
    const result: TValueInstructions = [evaluated, [...inst, ...evaluatedInst]];

    if (this.sourcemap) return appendSourceLocations(result, node);
    return result;
  }

  handleConsume(scope: IScope, node: es.Node): TValueInstructions {
    const [res, inst] = this.handle(scope, node);

    if (!res) throw new CompilerError("Cannot consume null", node);

    const [evaluated, evaluatedInst] = res.consume(scope);
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
   * handler methods ({@link handle}, {@link handleEval}, {@link handleConsume}
   * and {@link handleMany})
   *
   */
  handleMany<T extends es.Node>(
    scope: IScope,
    nodes: T[],
    handler?: (node: T) => TValueInstructions<IValue | null>
  ): TValueInstructions<null> {
    const lines = [];
    for (const node of hoistedFunctionNodes(nodes)) {
      const [, nodeLines] = this.handle(
        scope,
        node,
        handler && (() => handler(node))
      );
      lines.push(...nodeLines);
    }
    return [null, lines];
  }
}

/** Removes jump instructions that point right to the next line */
function hideRedundantJumps(inst: IInstruction[]) {
  for (let i = 0; i < inst.length; i++) {
    const instruction = inst[i];
    if (!(instruction instanceof JumpInstruction)) continue;

    const { address } = instruction;

    let searchIndex = i + 1;
    let current = inst[searchIndex];

    while (current.hidden) {
      if (
        current instanceof AddressResolver &&
        current.bonds.includes(address)
      ) {
        // only gets assigned if `current` is an adress resolver
        // that resolves the jump adress
        // and that is also right next to the jump,
        // without any actual instructions in between
        instruction.hidden = true;
        break;
      }
      searchIndex++;
      current = inst[searchIndex];
    }
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
