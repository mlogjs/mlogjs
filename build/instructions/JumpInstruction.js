"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JumpInstruction = exports.EJumpKind = void 0;
const InstructionBase_1 = require("./InstructionBase");
var EJumpKind;
(function (EJumpKind) {
    EJumpKind["Equal"] = "equal";
    EJumpKind["NotEqual"] = "notEqual";
    EJumpKind["LessThan"] = "lessThan";
    EJumpKind["LessThanEq"] = "lessThanEq";
    EJumpKind["GreaterThan"] = "greaterThan";
    EJumpKind["GreaterThanEq"] = "greaterThanEq";
    EJumpKind["StrictEqual"] = "strictEqual";
    EJumpKind["Always"] = "always";
})(EJumpKind = exports.EJumpKind || (exports.EJumpKind = {}));
class JumpInstruction extends InstructionBase_1.InstructionBase {
    constructor(address, kind, left, right) {
        super("jump", address, kind, left, right);
    }
}
exports.JumpInstruction = JumpInstruction;
//# sourceMappingURL=JumpInstruction.js.map