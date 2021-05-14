"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = void 0;
const values_1 = require("./values");
class Scope {
    constructor(values, parent = null, stacked = false, ntemp = 0, name = "", inst = []) {
        this.stacked = false;
        this.ntemp = 0;
        this.data = values;
        this.parent = parent;
        this.stacked = stacked;
        this.ntemp = ntemp;
        this.name = name;
        this.inst = inst;
    }
    copy() {
        const scope = new Scope(Object.assign({}, this.data), this.parent, this.stacked, this.ntemp, this.name, this.inst);
        scope.break = this.break;
        scope.continue = this.continue;
        scope.function = this.function;
        return scope;
    }
    createScope() {
        const scope = this.copy();
        scope.data = {};
        scope.parent = this;
        return scope;
    }
    createFunction(name, stacked) {
        return new Scope({}, this, stacked !== null && stacked !== void 0 ? stacked : this.stacked, 0, name, this.inst);
    }
    has(name) {
        if (name in this.data)
            return true;
        if (this.parent)
            return this.parent.has(name);
        return false;
    }
    get(name) {
        const value = this.data[name];
        if (value)
            return value;
        if (this.parent)
            return this.parent.get(name);
        throw Error(`${name} is not declared.`);
    }
    set(name, value) {
        if (name in this.data)
            throw Error(`${name} is already declared.`);
        return this.hardSet(name, value);
    }
    hardSet(name, value) {
        this.data[name] = value;
        return value;
    }
    make(name, storeName) {
        return this.set(name, this.stacked ? null : new values_1.StoreValue(this, storeName));
    }
}
exports.Scope = Scope;
//# sourceMappingURL=Scope.js.map