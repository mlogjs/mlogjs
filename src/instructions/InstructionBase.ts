import { IInstruction, TValue } from "../types";

export class InstructionBase implements IInstruction {
	hidden = false;
	args: (string | TValue)[];
    constructor(...args: (string | TValue)[]) {
        this.args = args
    }
	resolve(i: number) {}
    toString() {
        return this.args.filter(arg => arg).join(" ")
    }
}
