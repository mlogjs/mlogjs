"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectValue = void 0;
const operators_1 = require("../operators");
const VoidValue_1 = require("./VoidValue");
class ObjectValue extends VoidValue_1.VoidValue {
    constructor(scope, data = {}) {
        super(scope);
        this.constant = true;
        this.macro = true;
        this.data = data;
    }
    get(scope, key) {
        const member = this.data[key.data];
        if (member)
            return [member, []];
        const { $get } = this.data;
        if (!$get)
            throw new Error("Cannot get undefined member.");
        return $get.call(scope, [key]);
    }
    eval(scope) {
        const { $eval } = this.data;
        if (!$eval)
            return [this, []];
        return $eval.call(scope, []);
    }
    call(scope, args) {
        const { $call } = this.data;
        if (!$call)
            return super.call(scope, args);
        return $call.call(scope, args);
    }
}
exports.ObjectValue = ObjectValue;
for (const op of operators_1.operators) {
    ObjectValue.prototype[op] = function (...args) {
        const $ = this.data["$" + op];
        if (!$)
            return VoidValue_1.VoidValue.prototype[op].apply(this, args);
        // @ts-ignore
        return $.call(...args);
    };
}
//# sourceMappingURL=ObjectValue.js.map