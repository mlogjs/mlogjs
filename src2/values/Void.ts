
import { Scope } from "../Scope";
import {TValue} from "../types"

export class Void implements TValue {
    scope: Scope;
    data: { [k: string]: any; };
    constant: boolean;
    constructor(scope: Scope) {
        this.scope = scope
        this.data = {}
    }
}