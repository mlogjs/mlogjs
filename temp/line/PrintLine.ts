import { LineBase } from ".";
import { IValue } from "../value";

export class PrintLine extends LineBase {
    constructor(value:IValue) {
        super("print", value)
    }
}