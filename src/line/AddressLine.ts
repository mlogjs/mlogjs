import { IScope } from "../core";
import { LiteralValue } from "../value";
import { LineBase } from "./LineBase";

export class AddressLine extends LineBase {
    hidden = true
    constructor(...literals: LiteralValue[]) {
        super()
        this.addressBind(...literals)
    }
    bindBreak(scope: IScope) {
        scope.breakAddressLine = this
        return this
    }
    bindContinue(scope: IScope){
        scope.continueAddressLine = this
        return this
    }
}