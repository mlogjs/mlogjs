import { InstructionBase } from ".";
import { IValue } from "../types";

export class SetCounterInstruction extends InstructionBase {
	constructor(value: IValue) {
		super("set", "@counter", value);
	}
}
