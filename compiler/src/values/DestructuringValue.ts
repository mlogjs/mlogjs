import { IInstruction, IScope, IValue, TValueInstructions } from "../types";
import { VoidValue } from "./VoidValue";

/**
 * Specific case class, required on the ArrayPattern and ObjectPattern handlers
 * in order to keep the separation of concerns and make the code more modular.
 *
 * When it is assign a value, it will get it's own properties and recursively assign
 * each of them to their counterparts on the right hand value.
 */
export class DestructuringValue extends VoidValue {
  macro = true;

  constructor(scope: IScope, public members: Map<IValue, IValue>) {
    super(scope);
  }

  "="(scope: IScope, right: IValue): TValueInstructions {
    const inst: IInstruction[] = [];

    for (const [key, value] of this.members) {
      const [item, itemInst] = right.get(scope, key);
      inst.push(...itemInst);
      inst.push(...value["="](scope, item)[1]);
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
