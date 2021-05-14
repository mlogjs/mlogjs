"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstructionBase = void 0;
class InstructionBase {
    constructor(...args) {
        this._hidden = false;
        this.args = args;
    }
    get hidden() {
        return this._hidden;
    }
    set hidden(value) {
        this._hidden = value;
    }
    resolve(i) { }
    toString() {
        return this.args.filter(arg => arg).join(" ");
    }
}
exports.InstructionBase = InstructionBase;
//# sourceMappingURL=InstructionBase.js.map