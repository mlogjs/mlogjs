"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoidValue = void 0;
const operators_1 = require("../operators");
class VoidValue {
    constructor(scope) {
        this.constant = false;
        this.macro = false;
        this.scope = scope;
    }
    eval(scope) {
        throw new Error("Cannot eval.");
    }
    call(scope, args) {
        throw new Error("Cannot call.");
    }
    get(scope, name) {
        throw new Error("Cannot get.");
    }
    toString() {
        throw new Error("Cannot serialize.");
    }
}
exports.VoidValue = VoidValue;
for (const key of operators_1.operators) {
    VoidValue.prototype[key] = () => {
        throw new Error(`Cannot '${key}' operation.`);
    };
}
//# sourceMappingURL=VoidValue.js.map