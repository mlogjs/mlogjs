import { InstructionBase } from "../instructions";
import { IScope, IValue, TEOutput, TValueInstructions } from "../types";
import {
  BaseValue,
  LiteralValue,
  ObjectValue,
  SenseableValue,
  StoreValue,
} from "../values";
import { MacroFunction } from "./Function";
import { CompilerError } from "../CompilerError";

class MemoryEntry extends BaseValue {
  macro = true;
  private store: StoreValue | null = null;

  constructor(
    public scope: IScope,
    private mem: MemoryMacro,
    private prop: IValue
  ) {
    super();
  }

  eval(scope: IScope, out?: TEOutput): TValueInstructions {
    if (this.store) return [this.store, []];
    const temp = (this.store = StoreValue.from(scope, out));
    return [
      temp,
      [new InstructionBase("read", temp, this.mem.cell, this.prop)],
    ];
  }

  "="(scope: IScope, value: IValue): TValueInstructions {
    const [data, dataInst] = value.eval(scope);
    return [
      data,
      [
        ...dataInst,
        new InstructionBase("write", data, this.mem.cell, this.prop),
      ],
    ];
  }
}

class MemoryMacro extends ObjectValue {
  constructor(public cell: SenseableValue, size: LiteralValue) {
    super({
      $get: new MacroFunction((scope, out, prop: IValue) => {
        if (prop instanceof LiteralValue && !prop.isNumber())
          throw new CompilerError(
            `Invalid memory object property: "${prop.data}"`
          );
        const entry = new MemoryEntry(scope, this, prop);
        if (out) return entry.eval(scope, out);

        return [entry, []];
      }),
      length: size,
      size,
    });
  }

  toString() {
    return this.cell.toString();
  }
}

export class MemoryBuilder extends ObjectValue {
  constructor() {
    super({
      $call: new MacroFunction(
        (scope, out, cell: IValue, size: IValue = new LiteralValue(64)) => {
          if (!(cell instanceof SenseableValue))
            throw new CompilerError("Memory cell must be a senseable value.");

          if (!(size instanceof LiteralValue && size.isNumber()))
            throw new CompilerError(
              "The memory size must be a number literal."
            );

          return [new MemoryMacro(cell, size), []];
        }
      ),
    });
  }
}
