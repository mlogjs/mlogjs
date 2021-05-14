"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnStatement = exports.ContinueStatement = exports.BreakStatement = exports.BlockStatement = exports.ExpressionStatement = void 0;
const instructions_1 = require("../instructions");
const values_1 = require("../values");
const ExpressionStatement = (c, scope, node) => {
    return c.handle(scope, node.expression);
};
exports.ExpressionStatement = ExpressionStatement;
const BlockStatement = (c, scope, node) => {
    return c.handleMany(scope.createScope(), node.body);
};
exports.BlockStatement = BlockStatement;
const BreakStatement = (_, scope) => {
    const addr = new values_1.LiteralValue(scope, null);
    scope.break.bind(addr);
    return [null, [new instructions_1.JumpInstruction(addr, instructions_1.EJumpKind.Always)]];
};
exports.BreakStatement = BreakStatement;
const ContinueStatement = (_, scope) => {
    const addr = new values_1.LiteralValue(scope, null);
    scope.continue.bind(addr);
    return [null, [new instructions_1.JumpInstruction(addr, instructions_1.EJumpKind.Always)]];
};
exports.ContinueStatement = ContinueStatement;
const ReturnStatement = (c, scope, node) => {
    const [arg, argInst] = node.argument ? c.handle(scope, node.argument) : [null, []];
    const [ret, retInst] = scope.function.return(scope, arg);
    return [ret, [...argInst, ...retInst]];
};
exports.ReturnStatement = ReturnStatement;
//# sourceMappingURL=Statements.js.map