import { InstructionBase } from ".";
import { IScope } from "../types";
import { LiteralValue } from "../values";

export class AddressResolver extends InstructionBase {
    bindReturn(scope: IScope): import("../types").IInstruction {
        throw new Error("Method not implemented.");
    }
    hidden = true
    literals : LiteralValue[]
    constructor(...literals: LiteralValue[]) {
        super()
        this.literals = literals
    }
    resolve(i: number) {
        for (const literal of this.literals) literal.data = i
    }
    bind(literal: LiteralValue) {
        this.literals.push(literal)
    }
    bindBreak(scope: IScope) {
		scope.breakAddressResolver = this
        return this
	}
	bindContinue(scope: IScope) {
        scope.continueAddressResolver = this
        return this
	}
}