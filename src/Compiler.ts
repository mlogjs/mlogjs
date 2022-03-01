import { es, IScope, THandler, TValueInstructions } from "./types";
import * as handlers from "./handlers";
import { parseScript } from "esprima";
import { EndInstruction } from "./instructions";
import { Scope } from "./Scope";
import {
  BlockBuilder,
  Concat,
  MlogMath,
  StoreFactory,
  TempFactory,
  commands,
} from "./macros";
import { nodeName } from "./utils";
import { NamespaceMacro } from "./macros/Namespace";
import { RawValueMacro } from "./macros/RawValue";

type THandlerMap = { [k in es.Node["type"]]?: THandler };

export class Compiler {
  protected stackName?: string;
  protected usingStack: boolean;
  protected handlers: THandlerMap = handlers;

  constructor(stackName?: string) {
    this.usingStack = !!stackName;
    this.stackName = stackName;
  }

  compile(script: string): string {
    const program = this.parse(script);
    const scope = new Scope({});

    // namespaces
    scope.hardSet("ControlKind", new NamespaceMacro(scope));
    scope.hardSet("Vars", new NamespaceMacro(scope));
    scope.hardSet("Items", new NamespaceMacro(scope, { changeCasing: true }));
    scope.hardSet("Liquids", new NamespaceMacro(scope));
    scope.hardSet("Units", new NamespaceMacro(scope));
    scope.hardSet("LAccess", new NamespaceMacro(scope));
    scope.hardSet("UnitCommands", new NamespaceMacro(scope));
    scope.hardSet("Blocks", new NamespaceMacro(scope, { changeCasing: true }));

    // helper methods
    scope.hardSet("getBuilding", new RawValueMacro(scope));
    scope.hardSet("getVar", new RawValueMacro(scope));

    scope.hardSet("Block", new BlockBuilder(scope));
    scope.hardSet("Entity", new BlockBuilder(scope));
    scope.hardSet("Math", new MlogMath(scope));

    // commands
    scope.hardSet("draw", new commands.Draw(scope));
    scope.hardSet("print", new commands.Print(scope));
    scope.hardSet("printFlush", new commands.PrintFlush(scope));
    scope.hardSet("drawFlush", new commands.DrawFlush(scope));
    scope.hardSet("getLink", new commands.GetLink(scope));

    scope.hardSet("concat", new Concat(scope));
    scope.hardSet("Store", new StoreFactory(scope));
    scope.hardSet("Temp", new TempFactory(scope));

    const valueInst = this.handle(scope, program);
    valueInst[1].push(new EndInstruction(), ...scope.inst);
    this.resolve(valueInst);
    return this.serialize(valueInst) + "\n";
  }

  protected resolve(valueInst: TValueInstructions) {
    let i = 0;
    for (const inst of valueInst[1]) {
      inst.resolve(i);
      if (!inst.hidden) i++;
    }
  }

  protected serialize(resLines: TValueInstructions) {
    const [_, inst] = resLines;
    return inst.filter(l => !l.hidden).join("\n");
  }

  protected parse(script: string) {
    return parseScript(script, { loc: true });
  }

  handle(scope: IScope, node: es.Node): TValueInstructions {
    try {
      const handler = this.handlers[node.type];
      if (!handler) throw Error("Missing handler for " + node.type);
      return handler(this, scope, node, null);
    } catch (error) {
      throw new Error(`${node.type} ${nodeName(node)} > ${error.message}`);
    }
  }

  handleEval(scope: IScope, node: es.Node): TValueInstructions {
    const [res, inst] = this.handle(scope, node);
    const [evaluated, evaluatedLines] = res.eval(scope);
    return [evaluated, [...inst, ...evaluatedLines]];
  }

  handleMany(
    scope: IScope,
    nodes: es.Node[],
    handler: typeof Compiler.prototype.handle = this.handle.bind(this)
  ): TValueInstructions {
    const lines = [];
    for (const node of nodes) {
      const [_, nodeLines] = handler(scope, node);
      lines.push(...nodeLines);
    }
    return [null, lines];
  }
}
