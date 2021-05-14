"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressResolver = void 0;
const _1 = require(".");
class AddressResolver extends _1.InstructionBase {
    constructor(...bonds) {
        super();
        this.bonds = bonds;
    }
    get hidden() {
        return true;
    }
    set hidden(value) {
    }
    resolve(i) {
        for (const literal of this.bonds)
            literal.data = i;
    }
    bind(bond) {
        this.bonds.push(bond);
    }
    bindBreak(scope) {
        scope.break = this;
        return this;
    }
    bindContinue(scope) {
        scope.continue = this;
        return this;
    }
    bindReturn(scope) {
        throw new Error("Method not implemented.");
    }
}
exports.AddressResolver = AddressResolver;
//# sourceMappingURL=AddressResolver.js.map