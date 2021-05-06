import { LineBase } from ".";
import { EOperation, IValue } from "../value";

export class OperationLine extends LineBase {
    constructor(kind: EOperation, value: IValue, left: IValue, right?:IValue) {
        super("op", kind, value, left, right)
    }
}