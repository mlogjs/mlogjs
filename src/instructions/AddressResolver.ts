import { InstructionBase } from ".";
import { IInstruction, IScope, IBindableValue } from "../types";

export class AddressResolver extends InstructionBase {
    public get hidden() {
        return true
    }
    public set hidden(value) {
    }
    bonds : IBindableValue[]
    constructor(...bonds: IBindableValue[]) {
        super()
        this.bonds = bonds
    }
    resolve(i: number) {
        for (const literal of this.bonds) literal.data = i
    }
    bind(bond: IBindableValue) {
        this.bonds.push(bond)
    }
    bindBreak(scope: IScope) {
		scope.break = this
        return this
	}
	bindContinue(scope: IScope) {
        scope.continue = this
        return this
	}
    bindReturn(scope: IScope): IInstruction {
        throw new Error("Method not implemented.");
    }
}