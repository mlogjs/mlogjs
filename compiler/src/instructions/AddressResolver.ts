import { InstructionBase } from ".";
import { IScope, TLineRef } from "../types";

export class AddressResolver extends InstructionBase {
  public get hidden() {
    return true;
  }
  public set hidden(value) {}
  bonds: TLineRef[];
  constructor(...bonds: TLineRef[]) {
    super();
    this.bonds = bonds;
  }
  resolve(i: number) {
    for (const literal of this.bonds) literal.data = i;
  }
  bind(bond: TLineRef) {
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
