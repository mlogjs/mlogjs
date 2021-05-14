"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseValue = void 0;
const instructions_1 = require("../instructions");
const operators_1 = require("../operators");
const _1 = require(".");
class BaseValue extends _1.VoidValue {
    "u-"(scope) {
        const [that, inst] = this.eval(scope);
        const temp = new _1.TempValue(scope);
        return [
            temp,
            [...inst, new instructions_1.OperationInstruction("sub", temp, new _1.LiteralValue(scope, 0), that)],
        ];
    }
}
exports.BaseValue = BaseValue;
const operatorMap = {
    "==": "equal",
    "===": "strictEqual",
    "!=": "notEqual",
    "!==": "notEqual",
    "<": "lessThan",
    ">": "greaterThan",
    "<=": "lessThanEq",
    ">=": "greaterThanEq",
    "+": "add",
    "-": "sub",
    "*": "mul",
    "/": "div",
    "%": "mod",
    "**": "pow",
    "|": "or",
    "&": "and",
    "^": "xor",
    ">>": "shr",
    ">>>": "shr",
    "<<": "shl",
    "&&": "land",
    "||": "or",
};
for (const key in operatorMap) {
    const kind = operatorMap[key];
    BaseValue.prototype[key] = function (scope, value) {
        const [left, leftInst] = this.eval(scope);
        const [right, rightInst] = value.eval(scope);
        const temp = new _1.TempValue(scope);
        return [
            temp,
            [...leftInst, ...rightInst, new instructions_1.OperationInstruction(kind, temp, left, right)],
        ];
    };
}
const unaryOperatorMap = {
    "!": "not",
    "~": "flip",
};
for (const key in unaryOperatorMap) {
    const name = unaryOperatorMap[key];
    BaseValue.prototype[key] = function (scope) {
        const [that, inst] = this.eval(scope);
        const temp = new _1.TempValue(scope);
        return [temp, [...inst, new instructions_1.OperationInstruction(name, temp, that)]];
    };
}
const assignmentToBinary = {
    "+=": "+",
    "-=": "-",
    "*=": "*",
    "/=": "/",
    "%=": "%",
    "**=": "**",
    "|=": "|",
    "&=": "&",
    "^=": "^",
    ">>=": ">>",
    ">>>=": ">>>",
    "<<=": "<<",
    "&&=": "&&",
    "||=": "||",
};
for (const op in assignmentToBinary) {
    BaseValue.prototype[op] = function (scope, value) {
        const [opValue, opInst] = this[assignmentToBinary[op]](scope, value);
        const [retValue, retInst] = this["="](scope, opValue);
        return [retValue, [...opInst, ...retInst]];
    };
}
for (const key of operators_1.updateOperators) {
    BaseValue.prototype[key] = function (scope, prefix) {
        let [ret, inst] = this.eval(scope);
        if (!prefix) {
            const temp = new _1.TempValue(scope);
            const [tempValue, tempInst] = temp["="](scope, ret);
            ret = tempValue;
            inst.push(...tempInst);
        }
        const kind = key === "++" ? "+=" : "-=";
        return [ret, [...inst, ...this[kind](scope, new _1.LiteralValue(scope, 1))[1]]];
    };
}
//# sourceMappingURL=BaseValue.js.map