"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhileStatement = void 0;
const instructions_1 = require("../instructions");
const values_1 = require("../values");
const WhileStatement = (c, scope, node) => {
    const lines = [];
    const [test, testLines] = c.handleEval(scope, node.test);
    const startLoopAddr = new values_1.LiteralValue(scope, null);
    const endLoopAddr = new values_1.LiteralValue(scope, null);
    const startLoopLine = new instructions_1.AddressResolver(startLoopAddr).bindContinue(scope);
    const endLoopLine = new instructions_1.AddressResolver(endLoopAddr).bindBreak(scope);
    if (test instanceof values_1.LiteralValue) {
        if (test.data) {
            lines.push(startLoopLine, ...c.handle(scope, node.body)[1], new instructions_1.JumpInstruction(startLoopAddr, instructions_1.EJumpKind.Always), endLoopLine);
        }
        return [null, lines];
    }
    lines.push(startLoopLine, ...testLines, new instructions_1.JumpInstruction(endLoopAddr, instructions_1.EJumpKind.NotEqual, test, new values_1.LiteralValue(scope, 0)), ...c.handle(scope, node.body)[1], new instructions_1.JumpInstruction(startLoopAddr, instructions_1.EJumpKind.Always), endLoopLine);
    return [null, lines];
};
exports.WhileStatement = WhileStatement;
//# sourceMappingURL=WhileStatement.js.map