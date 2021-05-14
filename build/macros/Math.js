"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MlogMath = void 0;
const instructions_1 = require("../instructions");
const values_1 = require("../values");
const Function_1 = require("./Function");
const mathOperations = {
    max: (a, b) => Math.max(a, b),
    min: (a, b) => Math.min(a, b),
    angle: (a, b) => Math.atan2(a, b),
    len: (a, b) => Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)),
    noise: null,
    abs: (a) => Math.abs(a),
    log: (a) => Math.log(a),
    log10: (a) => Math.log(a) / Math.log(10),
    sin: (a) => Math.sin(a),
    cos: (a) => Math.cos(a),
    tan: (a) => Math.tan(a),
    floor: (a) => Math.floor(a),
    ceil: (a) => Math.ceil(a),
    sqrt: (a) => Math.ceil(a),
    rand: null,
};
function createMacroMathOperations(scope) {
    const macroMathOperations = {};
    for (const key in mathOperations) {
        const fn = mathOperations[key];
        macroMathOperations[key] = new Function_1.MacroFunction(scope, (a, b) => {
            if (fn && a instanceof values_1.LiteralValue && b instanceof values_1.LiteralValue) {
                if (typeof a.data !== "number" || typeof a.data !== "number")
                    throw new Error("Cannot do math operation with non-numerical literals.");
                return [new values_1.LiteralValue(scope, fn(a.num, b.num)), []];
            }
            const temp = new values_1.TempValue(scope);
            return [temp, [new instructions_1.OperationInstruction(key, temp, a, b)]];
        });
    }
    return macroMathOperations;
}
class MlogMath extends values_1.ObjectValue {
    constructor(scope) {
        super(scope, createMacroMathOperations(scope));
    }
}
exports.MlogMath = MlogMath;
// op angle result a b
// op len result a b
//# sourceMappingURL=Math.js.map