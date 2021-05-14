"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreValue = void 0;
const _1 = require(".");
const instructions_1 = require("../instructions");
class StoreValue extends _1.BaseValue {
    constructor(scope, name) {
        super(scope);
        this.constant = false;
        this.name = name;
    }
    "="(scope, value) {
        if (this.constant)
            throw new Error(`Cannot assign to unmutable store '${this.name}'.`);
        if (value instanceof _1.TempValue) {
            value.proxy(this);
            return [this, []];
        }
        const [evalValue, evalInst] = value.eval(scope);
        return [this, [...evalInst, new instructions_1.SetInstruction(this, evalValue)]];
    }
    eval(scope) {
        return [this, []];
    }
    toString() {
        return this.name;
    }
}
exports.StoreValue = StoreValue;
//# sourceMappingURL=StoreValue.js.map