import { InstructionBase } from "../instructions";
import { IScope, IValue, TEOutput, TValueInstructions } from "../types";
import {
  BaseValue,
  LiteralValue,
  ObjectValue,
  SenseableValue,
  StoreValue,
} from "../values";
import { CompilerError } from "../CompilerError";
import { MacroFunction } from "./Function";

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

  debugString(): string {
    return "MemoryEntry";
  }

  toString(): string {
    return '"[macro MemoryEntry]"';
  }
}

class MemoryMacro extends ObjectValue {
  constructor(public cell: SenseableValue, size: LiteralValue) {
    super({
      length: size,
      size,
    });
  }

  debugString(): string {
    return `Memory("${this.cell.toString()}")`;
  }

  get(scope: IScope, key: IValue, out?: TEOutput): TValueInstructions<IValue> {
    if (super.hasProperty(scope, key)) return super.get(scope, key, out);

    if (key instanceof LiteralValue && !key.isNumber())
      throw new CompilerError(
        `The member [${key.debugString()}] is not present in [${this.debugString()}]`
      );

    const entry = new MemoryEntry(scope, this, key);
    if (out) return entry.eval(scope, out);

    return [entry, []];
  }

  hasProperty(scope: IScope, prop: IValue): boolean {
    if (prop instanceof LiteralValue && prop.isNumber()) return true;
    return super.hasProperty(scope, prop);
  }

  toString() {
    return '"[macro Memory]"';
  }
}

export class MemoryBuilder extends MacroFunction {
  constructor() {
    super((scope, out, cell: IValue, size: IValue = new LiteralValue(64)) => {
      if (!(cell instanceof SenseableValue))
        throw new CompilerError("Memory cell must be a senseable value.");

      if (!(size instanceof LiteralValue && size.isNumber()))
        throw new CompilerError("The memory size must be a number literal.");

      return [new MemoryMacro(cell, size), []];
    });
  }
}
