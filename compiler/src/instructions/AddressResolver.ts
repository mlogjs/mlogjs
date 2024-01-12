import { InstructionBase } from ".";
import { TLineRef } from "../types";

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
}
