"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempValue = void 0;
const operators_1 = require("../operators");
const _1 = require("./");
class TempValue extends _1.StoreValue {
    constructor(scope, name) {
        super(scope, name !== null && name !== void 0 ? name : "t" + scope.ntemp + (scope.name ? ":" + scope.name : ""));
        this.auto = !name;
        if (this.auto)
            scope.ntemp++;
    }
    eval(scope) {
        if (this.auto)
            this.scope.ntemp--;
        return super.eval(scope);
    }
    proxy(value) {
        if (this.proxied)
            throw new Error("Cannot proxy multiple times.");
        this.proxied = value;
        if (this.auto)
            this.scope.ntemp--;
        for (const key of [...operators_1.operators, "eval", "get", "call", "toString", "proxy"]) {
            if (key in value)
                this[key] = (...args) => value[key].apply(value, args);
        }
    }
}
exports.TempValue = TempValue;
//# sourceMappingURL=TempValue.js.map