import { Scope } from "../Scope";
import { TValue } from "../types";
import { Void } from "./Void";

class Base extends Void implements TValue{
    constructor(scope: Scope) {
        super(scope)
    }
}

