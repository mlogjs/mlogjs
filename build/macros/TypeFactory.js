"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempFactory = exports.StoreFactory = void 0;
const values_1 = require("../values");
const Function_1 = require("./Function");
class StoreFactory extends Function_1.MacroFunction {
    constructor(scope) {
        super(scope, (value) => {
            if (value instanceof values_1.LiteralValue && typeof value.data === "string")
                return [new values_1.StoreValue(scope, value.data), []];
            throw new Error("Cannot create store value with name that is not a literal string");
        });
    }
}
exports.StoreFactory = StoreFactory;
class TempFactory extends Function_1.MacroFunction {
    constructor(scope) {
        super(scope, () => [new values_1.TempValue(scope), []]);
    }
}
exports.TempFactory = TempFactory;
//# sourceMappingURL=TypeFactory.js.map