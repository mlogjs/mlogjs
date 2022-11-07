import { SourceLocation } from "@babel/types";
import { EInstIntent, IInstruction, IValue } from "../types";

export class InstructionBase implements IInstruction {
  intent = EInstIntent.none;
  intentSource?: IValue;
  alwaysRuns = true;

  protected _hidden = false;
  public get hidden() {
    return this._hidden;
  }
  public set hidden(value) {
    this._hidden = value;
  }
  args: (string | IValue | null)[];

  source?: SourceLocation;

  constructor(...args: (string | IValue | null)[]) {
    this.args = args;
  }
  resolve(_i: number) {}
  toString() {
    return this.args.filter(arg => arg).join(" ");
  }
}
