import { LineBase } from ".";
import { IValue } from "../value";

export class SetLine extends LineBase {
    constructor(store: IValue, value: IValue) {
        super("set", store, value)
    }
}