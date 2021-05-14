import { InstructionBase } from "../instructions";
import { IScope, IValue } from "../types";
import { MacroFunction } from "./Function";

export class Print extends MacroFunction {
    constructor(scope: IScope) {
        super(scope, (...values: IValue[]) => {
            return [null, [new InstructionBase("print", ...values)]]
        })
    }
}