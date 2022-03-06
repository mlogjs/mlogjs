import { operators } from "../operators";
import { InstructionBase, OperationInstruction } from "../instructions";
import { IScope, IValue } from "../types";
import {
  BaseValue,
  LiteralValue,
  ObjectValue,
  StoreValue,
  TempValue,
  VoidValue,
} from "../values";
import { MacroFunction } from "./Function";

class MemoryEntry extends ObjectValue {
  constructor(scope: IScope, mem: MemoryMacro, prop: IValue) {
    super(scope, {
      $eval: new MacroFunction(scope, () => {
        const temp = new TempValue(scope);
        return [temp, [new InstructionBase("read", temp, mem.cell, prop)]];
      }),
      "$=": new MacroFunction(scope, value => {
        return [
          null as never,
          [new InstructionBase("write", prop, mem.cell, value)],
        ];
      }),
    });
  }
}

for (const operator of operators) {
  if (operator === "=") continue;
  MemoryEntry.prototype[operator] = function (
    this: MemoryEntry,
    ...args: unknown[]
  ) {
    return (BaseValue.prototype[operator] as Function).apply(this, args);
  } as never;
}

class MemoryMacro extends ObjectValue {
  name: string;
  toString() {
    return this.name;
  }
  constructor(scope: IScope, public cell: ObjectValue, size: LiteralValue) {
    super(scope, {
      $get: new MacroFunction(scope, (prop: IValue) => {
        if (prop instanceof LiteralValue && typeof prop.data !== "number")
          return [new VoidValue(scope), []];
        const obj = new MemoryEntry(scope, this, prop);
        return [obj, []];
      }),
      length: size,
      size,
    });

    this.name = cell.toString();
  }
}

export class MemoryBuilder extends ObjectValue {
  constructor(scope: IScope) {
    super(scope, {
      $call: new MacroFunction(
        scope,
        (cell: IValue, size: IValue = new LiteralValue(scope, 64)) => {
          if (!(cell instanceof ObjectValue))
            throw new Error("Memory cell must be a building object.");

          if (!(size instanceof LiteralValue && typeof size.data === "number"))
            throw new Error("The memory size must be a number literal.");

          return [new MemoryMacro(scope, cell, size), []];
        }
      ),
    });
  }
}
