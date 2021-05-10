import { SetInstruction } from "../instructions";
import { IScope, TValue, TValueInstructions } from "../types";
import { StoreValue } from "./";

export class TempValue extends StoreValue {
    setInstruction: SetInstruction
    constructor(scope: IScope) {
        super(scope, "$temp" + scope.tempIndex)
        scope.tempIndex++
    }
    eval(scope: IScope): TValueInstructions {
        scope.tempIndex--
        if (this.setInstruction) this.setInstruction.hidden = false
        return super.eval(scope)
    }
    "="(scope: IScope, value: TValue): TValueInstructions {
        const [evalValue, evalInst] = value.eval(scope)
        this.setInstruction = new SetInstruction(this, evalValue)
        this.setInstruction.hidden = true
		return [this, [...evalInst, this.setInstruction]];
	}
}