import { IInstruction, IValue } from "../types";

export class InstructionBase implements IInstruction {
	hidden = false;
	args: (string | IValue)[];
    constructor(...args: (string | IValue)[]) {
        this.args = args
    }
	resolve(i: number) {}
    toString() {
        return this.args.filter(arg => arg).join(" ")
    }
}
