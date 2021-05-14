"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Literal = void 0;
const values_1 = require("../values");
const Literal = (c, scope, node) => {
    const { value } = node;
    if (value === null || typeof value === "string" || typeof value === "number") {
        return [new values_1.LiteralValue(scope, value), []];
    }
    if (typeof value === "boolean") {
        return [new values_1.LiteralValue(scope, +value), []];
    }
    throw Error("Cannot create literal " + typeof value);
};
exports.Literal = Literal;
//# sourceMappingURL=Literal.js.map