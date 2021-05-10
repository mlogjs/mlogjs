import { InstructionBase } from ".";
import { TValue } from "../types";

export class SetInstruction extends InstructionBase{
    constructor(store: TValue, value: TValue) {
        super("set", store, value)
    }
}