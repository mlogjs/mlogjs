"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetCounterInstruction = void 0;
const _1 = require(".");
class SetCounterInstruction extends _1.InstructionBase {
    constructor(value) {
        super("set", "@counter", value);
    }
}
exports.SetCounterInstruction = SetCounterInstruction;
//# sourceMappingURL=SetCounterInstruction.js.map