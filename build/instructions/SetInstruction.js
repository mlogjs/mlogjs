"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetInstruction = void 0;
const _1 = require(".");
class SetInstruction extends _1.InstructionBase {
    constructor(store, value) {
        super("set", store, value);
    }
}
exports.SetInstruction = SetInstruction;
//# sourceMappingURL=SetInstruction.js.map