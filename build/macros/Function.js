"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacroFunction = void 0;
const values_1 = require("../values");
class MacroFunction extends values_1.VoidValue {
    constructor(scope, fn) {
        super(scope);
        this.macro = true;
        this.constant = true;
        this.fn = fn;
    }
    call(scope, args) {
        return this.fn.apply(this, args);
    }
    eval(scope) {
        return [this, []];
    }
}
exports.MacroFunction = MacroFunction;
//# sourceMappingURL=Function.js.map