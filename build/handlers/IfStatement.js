"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfStatement = void 0;
const instructions_1 = require("../instructions");
const instructions_2 = require("../instructions");
const values_1 = require("../values");
const IfStatement = (c, scope, node) => {
    const inst = [];
    const [test, testInst] = c.handleEval(scope, node.test);
    if (test instanceof values_1.LiteralValue) {
        if (test.data)
            inst.push(...c.handle(scope, node.consequent)[1]);
        else if (node.alternate)
            inst.push(...c.handle(scope, node.alternate)[1]);
        return [null, inst];
    }
    const endIfAddr = new values_1.LiteralValue(scope, null);
    inst.push(...testInst, new instructions_1.JumpInstruction(endIfAddr, instructions_2.EJumpKind.NotEqual, test, new values_1.LiteralValue(scope, 0)), ...c.handle(scope, node.consequent)[1], new instructions_1.AddressResolver(endIfAddr));
    const endElseAddr = new values_1.LiteralValue(scope, null);
    if (node.alternate)
        inst.push(new instructions_1.JumpInstruction(endElseAddr, instructions_2.EJumpKind.Always), new instructions_1.AddressResolver(endIfAddr), ...c.handle(scope, node.alternate)[1], new instructions_1.AddressResolver(endElseAddr));
    return [null, inst];
};
exports.IfStatement = IfStatement;
//# sourceMappingURL=IfStatement.js.map