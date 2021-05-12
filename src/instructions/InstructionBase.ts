import { IInstruction, IValue } from "../types";

export class InstructionBase implements IInstruction {
	private _hidden = false;
    public get hidden() {
        return this._hidden;
    }
    public set hidden(value) {
        this._hidden = value;
    }
	args: (string | IValue)[];
    constructor(...args: (string | IValue)[]) {
        this.args = args
    }
	resolve(i: number) {}
    toString() {
        return this.args.filter(arg => arg).join(" ")
    }
}
