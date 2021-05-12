import { InstructionBase } from ".";
import { IInstruction, IScope, TBindableValue } from "../types";

export class AddressResolver extends InstructionBase {
    public get hidden() {
        return true
    }
    public set hidden(value) {
    }
    bonds : TBindableValue[]
    constructor(...bonds: TBindableValue[]) {
        super()
        this.bonds = bonds
    }
    resolve(i: number) {
        for (const literal of this.bonds) literal.data = i
    }
    bind(bond: TBindableValue) {
        this.bonds.push(bond)
    }
    bindBreak(scope: IScope) {
		scope.breakAddressResolver = this
        return this
	}
	bindContinue(scope: IScope) {
        scope.continueAddressResolver = this
        return this
	}
    bindReturn(scope: IScope): IInstruction {
        throw new Error("Method not implemented.");
    }
}