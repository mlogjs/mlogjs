"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
const handlers = __importStar(require("./handlers"));
const esprima_1 = require("esprima");
const instructions_1 = require("./instructions");
const Scope_1 = require("./Scope");
const macros_1 = require("./macros");
const Draw_1 = require("./macros/Draw");
class Compiler {
    constructor(stackName) {
        this.handlers = handlers;
        this.usingStack = !!stackName;
        this.stackName = stackName;
    }
    compile(script) {
        const program = this.parse(script);
        const scope = new Scope_1.Scope({});
        scope.hardSet("Block", new macros_1.BlockBuilder(scope));
        scope.hardSet("Math", new macros_1.MlogMath(scope));
        scope.hardSet("draw", new Draw_1.Draw(scope));
        scope.hardSet("Store", new macros_1.StoreFactory(scope));
        scope.hardSet("Temp", new macros_1.TempFactory(scope));
        const valueInst = this.handle(scope, program);
        valueInst[1].push(new instructions_1.EndInstruction(), ...scope.inst);
        console.log(valueInst[1]);
        this.resolve(valueInst);
        return this.serialize(valueInst);
    }
    resolve(valueInst) {
        let i = 0;
        for (const inst of valueInst[1]) {
            inst.resolve(i);
            if (!inst.hidden)
                i++;
        }
    }
    serialize(resLines) {
        const [_, inst] = resLines;
        return inst.filter((l) => !l.hidden).join("\n");
    }
    parse(script) {
        return esprima_1.parseScript(script, { loc: true });
    }
    handle(scope, node) {
        const handler = this.handlers[node.type];
        if (!handler)
            throw Error("Missing handler for " + node.type);
        return handler(this, scope, node, null);
    }
    handleEval(scope, node) {
        const [res, inst] = this.handle(scope, node);
        const [evaluated, evaluatedLines] = res.eval(scope);
        return [evaluated, [...inst, ...evaluatedLines]];
    }
    handleMany(scope, nodes, handler = this.handle.bind(this)) {
        const lines = [];
        for (const node of nodes) {
            const [_, nodeLines] = handler(scope, node);
            lines.push(...nodeLines);
        }
        return [null, lines];
    }
}
exports.Compiler = Compiler;
//# sourceMappingURL=Compiler.js.map