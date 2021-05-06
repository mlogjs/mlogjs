import { LiteralValue } from "../value";
import { LineBase } from "./LineBase";

export class AddressLine extends LineBase {
    hidden = true
    constructor(...literals: LiteralValue[]) {
        super()
        this.addressBind(...literals)
    }
}