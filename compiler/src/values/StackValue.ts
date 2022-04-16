import { BaseValue, LiteralValue, StoreValue } from ".";
import { CompilerError } from "../CompilerError";
import { InstructionBase, OperationInstruction } from "../instructions";
import { IScope, IValue, TValueInstructions } from "../types";
import { discardedName, createTemp } from "../utils";

/**
 * `StackValue` represents values unknown at compile time inside a stack memory,
 * mostly used with mutable variables and temporary values
 */
export class StackValue extends BaseValue implements IValue {
  constant = false;
  offset: number;
  constructor(scope: IScope) {
    super(scope);
    this.offset = scope.ntemp;
  }

  typeof(scope: IScope): TValueInstructions {
    return [new LiteralValue(scope, "stack"), []];
  }

  "="(scope: IScope, value: IValue): TValueInstructions {
    if (this.constant)
      throw new CompilerError(`Cannot assign to unmutable store '${this}'.`);
    if (!this.owner)
      throw new CompilerError(`Cannot assign to temporary value`);
    if (this.owner === value.owner && value instanceof StoreValue)
      return [this, []];
    if (!value.owner?.persistent) {
      if (!value.owner) this.owner.own(value);
      else value.owner.moveInto(this.owner);
      if (value instanceof StoreValue) return [this, []];
    }
    const [evalValue, evalInst] = value.consume(scope);
    const temp = createTemp(scope);
    return [
      evalValue,
      [
        ...evalInst,
        new OperationInstruction(
          "add",
          temp,
          new LiteralValue(scope, this.offset),
          scope.stackFrame
        ),
        new InstructionBase("write", evalValue, scope.stackMemory, temp),
      ],
    ];
  }
  eval(scope: IScope): TValueInstructions {
    const temp = createTemp(scope);
    return [
      temp,
      [
        new OperationInstruction(
          "add",
          temp,
          new LiteralValue(scope, this.offset),
          scope.stackFrame
        ),
        new InstructionBase("read", temp, scope.stackMemory, temp),
      ],
    ];
  }
  consume(_scope: IScope): TValueInstructions {
    this.ensureOwned();
    return this.eval(_scope);
  }

  toString() {
    return this.owner?.name ?? discardedName;
  }
}
