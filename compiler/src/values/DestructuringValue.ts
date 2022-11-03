import { IInstruction, IScope, IValue, TValueInstructions } from "../types";
import { VoidValue } from "./VoidValue";

export type TDestructuringMembers = Map<
  IValue,
  {
    value: IValue;
    /**
     * Handles the input value, is responsible for the assignment.
     *
     * Can mutate the instruction array.
     */
    handler(inst: TValueInstructions): void;
  }
>;

/**
 * Specific case class, required on the ArrayPattern and ObjectPattern handlers
 * in order to keep the separation of concerns and make the code more modular.
 *
 * When it is assign a value, it will get it's own properties and recursively assign
 * each of them to their counterparts on the right hand value.
 */
export class DestructuringValue extends VoidValue {
  macro = true;

  constructor(public members: TDestructuringMembers) {
    super();
  }

  "="(scope: IScope, right: IValue): TValueInstructions {
    const inst: IInstruction[] = [];

    for (const [key, { value, handler }] of this.members) {
      const [item, itemInst] = right.get(scope, key, value);
      handler([item, itemInst]);
      inst.push(...itemInst);
    }
    return [right, inst];
  }

  eval(_scope: IScope): TValueInstructions<IValue> {
    return [this, []];
  }

  consume(_scope: IScope): TValueInstructions<IValue> {
    return [this, []];
  }
}
