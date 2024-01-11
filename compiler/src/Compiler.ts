import { parse } from "@babel/parser";
import { CompilerError } from "./CompilerError";
import * as handlers from "./handlers";
import { createGlobalScope } from "./modules";
import { es, IInstruction, THandler } from "./types";
import { hideRedundantJumps } from "./utils";
import { CompilerContext } from "./CompilerContext";
import { HandlerContext } from "./HandlerContext";
import { Block, EndInstruction, Graph } from "./flow";

type THandlerMap = { [k in es.Node["type"]]?: THandler };

export interface CompilerOptions {
  /** Wether the compiler should preserve or compact variable and function names */
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
    script: string,
  ): [string, null, es.SourceLocation[] | undefined] | [null, CompilerError] {
    let output: string;
    let sourcemaps: es.SourceLocation[] | undefined;

    try {
      const c = new CompilerContext(this);
      const program = this.parse(script);
      const globalScope = createGlobalScope(c);
      // this allows the user to shadow global variables inside
      // the script, since it is treated as a module
      const scope = globalScope.createScope();

      const rootContext = new HandlerContext(
        new Block([]),
        new Block([], new EndInstruction()),
      );

      c.handle(scope, rootContext, program);
      c.resolveTypes();

      const rootGraph = Graph.from(rootContext.entry, rootContext.exit);

      const inst = rootGraph.toMlog(c);

      // const valueInst = this.handle(scope, program);
      // if (needsEndInstruction(valueInst[1], scope)) {
      //   valueInst[1].push(new EndInstruction());
      // }
      // valueInst[1].push(...scope.inst);

      hideRedundantJumps(inst);
      this.resolve(inst);
      output = this.serialize(inst) + "\n";
      if (this.sourcemap) {
        sourcemaps = this.mapSources(inst);
      }
    } catch (error) {
      const err =
        error instanceof CompilerError ? error : CompilerError.from(error);
      return [null, err];
    }
    return [output, null, sourcemaps];
  }

  protected resolve(instructions: IInstruction[]) {
    let i = 0;
    for (const inst of instructions) {
      inst.resolve(i);
      if (!inst.hidden) i++;
    }
  }

  protected serialize(inst: IInstruction[]) {
    return inst.filter(l => !l.hidden).join("\n");
  }

  protected parse(script: string) {
    return parse(script, {
      ranges: true,
      plugins: ["typescript"],
      sourceType: "module",
    });
  }

  protected mapSources(insts: IInstruction[]): es.SourceLocation[] {
    const result: es.SourceLocation[] = [];

    for (const inst of insts) {
      if (!inst.hidden) result.push(inst.source as es.SourceLocation);
    }

    return result;
  }
}
