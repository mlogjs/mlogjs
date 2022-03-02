import { InstructionBase } from "../instructions";
import { IScope, IValue } from "../types";
import {
  LiteralValue,
  ObjectValue,
  StoreValue,
  TempValue,
  VoidValue,
} from "../values";
import { MacroFunction } from "./Function";

class MemoryMacro extends ObjectValue {
  name: string;
  toString() {
    return this.name;
  }
  constructor(scope: IScope, cell: ObjectValue, size: LiteralValue) {
    super(scope, {
      $get: new MacroFunction(scope, (prop: IValue) => {
        if (prop instanceof LiteralValue && typeof prop.data !== "number")
          return [new VoidValue(scope), []];
        const cellValue =
          cell instanceof LiteralValue ? (cell.data as string) : cell;
        const obj = new ObjectValue(scope, {
          $eval: new MacroFunction(scope, () => {
            const temp = new TempValue(scope);
            return [temp, [new InstructionBase("read", temp, cellValue, prop)]];
          }),
          "$=": new MacroFunction(scope, value => {
            return [
              null,
              [new InstructionBase("write", prop, cellValue, value)],
            ];
          }),
        });
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
