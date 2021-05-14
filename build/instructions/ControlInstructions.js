"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnInstruction = exports.ContinueInstruction = exports.BreakInstruction = void 0;
const JumpInstruction_1 = require("./JumpInstruction");
class BreakInstruction extends JumpInstruction_1.JumpInstruction {
    constructor(address) {
        super(address, JumpInstruction_1.EJumpKind.Always);
    }
}
exports.BreakInstruction = BreakInstruction;
class ContinueInstruction extends JumpInstruction_1.JumpInstruction {
    constructor(address) {
        super(address, JumpInstruction_1.EJumpKind.Always);
    }
}
exports.ContinueInstruction = ContinueInstruction;
class ReturnInstruction extends JumpInstruction_1.JumpInstruction {
    constructor(address) {
        super(address, JumpInstruction_1.EJumpKind.Always);
    }
}
exports.ReturnInstruction = ReturnInstruction;
//# sourceMappingURL=ControlInstructions.js.map