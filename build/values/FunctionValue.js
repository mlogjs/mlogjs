"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionValue = void 0;
const instructions_1 = require("../instructions");
const LiteralValue_1 = require("./LiteralValue");
const StoreValue_1 = require("./StoreValue");
const TempValue_1 = require("./TempValue");
const VoidValue_1 = require("./VoidValue");
class FunctionValue extends VoidValue_1.VoidValue {
    constructor(scope, name, paramNames, paramStores, body, c) {
        super(scope);
        this.constant = true;
        this.macro = true;
        this.bundled = false;
        this.name = name;
        this.paramNames = paramNames;
        this.paramStores = paramStores;
        this.body = body;
        this.c = c;
        this.callSize = paramStores.length + 2;
        scope.function = this;
        this.createValues();
        this.createInst();
    }
    createValues() {
        this.addr = new LiteralValue_1.LiteralValue(this.scope, null);
        this.temp = new StoreValue_1.StoreValue(this.scope, "f" + this.name);
        this.ret = new StoreValue_1.StoreValue(this.scope, "r" + this.name);
    }
    createInst() {
        this.inst = [new instructions_1.AddressResolver(this.addr), ...this.c.handle(this.scope, this.body)[1]];
        const [last] = this.inst.filter(v => !(v instanceof instructions_1.AddressResolver)).slice(-1);
        if (!(last instanceof instructions_1.SetCounterInstruction && last.args[2] === this.ret)) {
            this.inst.push(new instructions_1.SetCounterInstruction(this.ret));
        }
    }
    normalReturn(scope, arg) {
        const argInst = arg ? this.temp["="](scope, arg)[1] : [];
        return [null, [...argInst, new instructions_1.SetCounterInstruction(this.ret)]];
    }
    normalCall(scope, args) {
        if (!this.bundled)
            this.scope.inst.push(...this.inst);
        this.bundled = true;
        const callAddressLiteral = new LiteralValue_1.LiteralValue(scope, null);
        const inst = this.paramStores
            .map((param, i) => param["="](scope, args[i])[1])
            .reduce((s, c) => s.concat(c), [])
            .concat(...this.ret["="](scope, callAddressLiteral)[1], new instructions_1.JumpInstruction(this.addr, instructions_1.EJumpKind.Always), new instructions_1.AddressResolver(callAddressLiteral));
        return [this.temp, inst];
    }
    inlineReturn(scope, arg) {
        const argInst = arg ? this.inlineTemp["="](scope, arg)[1] : [];
        return [null, [...argInst, new instructions_1.JumpInstruction(this.inlineEnd, instructions_1.EJumpKind.Always)]];
    }
    inlineCall(scope, args) {
        // create return value
        this.inlineTemp = new TempValue_1.TempValue(scope);
        this.inlineEnd = new LiteralValue_1.LiteralValue(scope, null);
        // make a copy of the function scope
        const fnScope = this.scope.copy();
        // hard set variables within the function scope
        this.paramNames.forEach((name, i) => fnScope.hardSet(name, args[i]));
        this.tryingInline = true;
        let inst = this.c.handle(fnScope, this.body)[1];
        this.tryingInline = false;
        // get the last instructions
        const [jump] = inst.slice(-1);
        if (jump instanceof instructions_1.JumpInstruction) {
            // remove useless jump
            if (jump.args[1] === this.inlineEnd)
                inst.pop();
        }
        inst.push(new instructions_1.AddressResolver(this.inlineEnd));
        // return the function value
        return [this.inlineTemp, inst];
    }
    call(scope, args) {
        if (args.length !== this.paramStores.length)
            throw new Error("Cannot call: argument count not matching.");
        const inlineCall = this.inlineCall(scope, args);
        const inlineSize = inlineCall[1].filter((i) => !i.hidden).length;
        if (this.inline || inlineSize <= this.callSize)
            return inlineCall;
        return this.normalCall(scope, args);
    }
    return(scope, arg) {
        if (arg && arg.macro) {
            this.inline = true;
            return [null, []];
        }
        if (this.inline || this.tryingInline)
            return this.inlineReturn(scope, arg);
        return this.normalReturn(scope, arg);
    }
    eval(scope) {
        return [this, []];
    }
}
exports.FunctionValue = FunctionValue;
//# sourceMappingURL=FunctionValue.js.map