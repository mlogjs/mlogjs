import { InstructionBase } from "../instructions";
import {
  EMutability,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { BaseValue, LiteralValue, ObjectValue, StoreValue } from "../values";
import { CompilerError } from "../CompilerError";
import { MacroFunction } from "./Function";
import { extractOutName } from "../utils";

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

  toMlogString(): string {
    return '"[macro MemoryEntry]"';
  }
}

class MemoryMacro extends ObjectValue {
  constructor(public cell: StoreValue, size: LiteralValue | StoreValue) {
    super({
      length: size,
      size,
    });
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
    if (
      (prop instanceof LiteralValue && prop.isNumber()) ||
      prop instanceof StoreValue
    )
      return true;
    return super.hasProperty(scope, prop);
  }

  debugString(): string {
    return `Memory("${this.cell.toMlogString()}")`;
  }

  toMlogString() {
    return '"[macro Memory]"';
  }
}

export class MemoryBuilder extends MacroFunction {
  constructor() {
    super((scope, out, cell: IValue, size: IValue = new LiteralValue(64)) => {
      if (!(cell instanceof StoreValue))
        throw new CompilerError("Memory cell must be a store value.");

      if (
        !(size instanceof LiteralValue && size.isNumber()) &&
        !(size instanceof StoreValue)
      )
        throw new CompilerError(
          "The memory size must be a number literal or a store."
        );

      if (
        size.mutability === EMutability.constant ||
        size.mutability === EMutability.immutable
      ) {
        return [new MemoryMacro(cell, size), []];
      }

      const name = extractOutName(out) ?? scope.makeTempName();
      const store = new StoreValue(`${name}.&len`);
      const [, inst] = store["="](scope, size);
      store.mutability = EMutability.immutable;
      return [new MemoryMacro(cell, store), inst];
    });
  }
}
