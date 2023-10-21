import { CompilerError } from "../../CompilerError";
import { InstructionBase } from "../../instructions";
import { IScope, IValue, TEOutput, TValueInstructions } from "../../types";
import {
  LiteralValue,
  ObjectValue,
  VoidValue,
  formatSenseablePropName,
} from "../../values";
import { MacroFunction } from "../Function";

export class SetProp extends MacroFunction {
  constructor() {
    super((scope, out, target) => {
      if (!target) throw new CompilerError("Missing argument: target");

      return [new Settable(target), []];
    });
  }
}

class SettableEntry extends VoidValue {
  macro = true;
  constructor(
    public target: IValue,
    public prop: IValue,
  ) {
    super();
  }

  eval(scope: IScope, out?: TEOutput | undefined): TValueInstructions {
    return this.target.get(scope, this.prop, out);
  }

  "="(scope: IScope, value: IValue): TValueInstructions {
    let prop: string | IValue = this.prop;
    if (prop instanceof LiteralValue && prop.isString())
      prop = formatSenseablePropName(prop.data);
    return [value, [new InstructionBase("setprop", prop, this.target, value)]];
  }

  debugString(): string {
    return "SettableEntry";
  }

  toMlogString(): string {
    return "[macro SettableEntry]";
  }
}

class Settable extends ObjectValue {
  constructor(public target: IValue) {
    super({});
  }

  get(
    scope: IScope,
    key: IValue,
    out?: TEOutput | undefined,
  ): TValueInstructions {
    const entry = new SettableEntry(this.target, key);
    if (out) return entry.eval(scope, out);
    return [entry, []];
  }
}
