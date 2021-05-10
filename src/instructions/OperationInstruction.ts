import { InstructionBase } from ".";
import { TValue } from "../types";

export class OperationInstruction extends InstructionBase{
    constructor(kind: string, temp: TValue, left: TValue, right?: TValue) {
        super("op", kind, temp, left, right)
    }
}