"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeroSpaceInstruction = void 0;
const InstructionBase_1 = require("./InstructionBase");
class ZeroSpaceInstruction extends InstructionBase_1.InstructionBase {
    toString() {
        return this.args.join("");
    }
}
exports.ZeroSpaceInstruction = ZeroSpaceInstruction;
//# sourceMappingURL=ZeroSpaceInstruction.js.map