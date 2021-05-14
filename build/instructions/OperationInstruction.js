"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationInstruction = void 0;
const _1 = require(".");
class OperationInstruction extends _1.InstructionBase {
    constructor(kind, temp, left, right) {
        super("op", kind, temp, left, right);
    }
}
exports.OperationInstruction = OperationInstruction;
//# sourceMappingURL=OperationInstruction.js.map