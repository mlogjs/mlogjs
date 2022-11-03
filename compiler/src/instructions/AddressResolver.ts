import { InstructionBase } from ".";
import { IBindableValue, IScope } from "../types";

export class AddressResolver extends InstructionBase {
  public get hidden() {
    return true;
  }
  public set hidden(value) {}
  bonds: IBindableValue<number | null>[];
  constructor(...bonds: IBindableValue<number | null>[]) {
    super();
    this.bonds = bonds;
  }
  resolve(i: number) {
    for (const literal of this.bonds) literal.data = i;
  }
  bind(bond: IBindableValue<number | null>) {
    this.bonds.push(bond);
  }
  bindBreak(scope: IScope) {
    scope.break = this;
    return this;
  }
  bindContinue(scope: IScope) {
    scope.continue = this;
    return this;
  }
}
