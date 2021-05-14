"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForStatement = void 0;
const instructions_1 = require("../instructions");
const values_1 = require("../values");
const ForStatement = (c, scope, node) => {
    scope = scope.createScope();
    const initInst = node.init ? c.handle(scope, node.init)[1] : [];
    const [test, testLines] = node.test
        ? c.handleEval(scope, node.test)
        : [new values_1.LiteralValue(scope, 1), []];
    const updateLines = node.update ? c.handle(scope, node.update)[1] : [];
    const startLoopAddr = new values_1.LiteralValue(scope, null);
    const endLoopAddr = new values_1.LiteralValue(scope, null);
    const startLoopLine = new instructions_1.AddressResolver(startLoopAddr).bindContinue(scope);
    const endLoopLine = new instructions_1.AddressResolver(endLoopAddr).bindBreak(scope);
    return [
        null,
        [
            ...initInst,
            startLoopLine,
            ...testLines,
            new instructions_1.JumpInstruction(endLoopAddr, instructions_1.EJumpKind.NotEqual, test, new values_1.LiteralValue(scope, 0)),
            ...c.handle(scope, node.body)[1],
            ...updateLines,
            new instructions_1.JumpInstruction(startLoopAddr, instructions_1.EJumpKind.Always),
            endLoopLine,
        ],
    ];
};
exports.ForStatement = ForStatement;
//# sourceMappingURL=ForStatement.js.map