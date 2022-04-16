import { operators } from "../operators";
import { InstructionBase } from "../instructions";
import { IScope, IValue } from "../types";
import {
  BaseValue,
  LiteralValue,
  ObjectValue,
  SenseableValue,
  StoreValue,
} from "../values";
import { MacroFunction } from "./Function";
import { CompilerError } from "../CompilerError";

class MemoryEntry extends ObjectValue {
  private store: StoreValue | null = null;

  constructor(scope: IScope, mem: MemoryMacro, prop: IValue) {
    super(scope, {
      $eval: new MacroFunction(scope, () => {
        if (this.store) return [this.store, []];
        const temp = new StoreValue(scope);
        return [temp, [new InstructionBase("read", temp, mem.cell, prop)]];
      }),
      $consume: new MacroFunction(scope, () => {
        if (this.store) return [this.store, []];
        this.ensureOwned();
        this.store = new StoreValue(scope);
        this.owner.own(this.store);
        return [
          this.store,
          [new InstructionBase("read", this.store, mem.cell, prop)],
        ];
      }),
      "$=": new MacroFunction(scope, value => {
        const [data, dataInst] = value.consume(scope);
        return [
          data,
          [...dataInst, new InstructionBase("write", data, mem.cell, prop)],
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
    // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unsafe-return
    return (BaseValue.prototype[operator] as Function).apply(this, args);
  };
}

class MemoryMacro extends ObjectValue {
  name: string;
  toString() {
    return this.name;
  }
  constructor(scope: IScope, public cell: SenseableValue, size: LiteralValue) {
    super(scope, {
      $get: new MacroFunction(scope, (prop: IValue) => {
        if (prop instanceof LiteralValue && typeof prop.data !== "number")
          throw new CompilerError(
            `Invalid memory object property: "${prop.data}"`
          );
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
          if (!(cell instanceof SenseableValue))
            throw new CompilerError("Memory cell must be a senseable value.");

          if (!(size instanceof LiteralValue && typeof size.data === "number"))
            throw new CompilerError(
              "The memory size must be a number literal."
            );

          return [new MemoryMacro(scope, cell, size), []];
        }
      ),
    });
  }
}
