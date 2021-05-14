"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = void 0;
const Compiler_1 = require("./Compiler");
const compiler = new Compiler_1.Compiler();
const compile = (script) => compiler.compile(script);
exports.compile = compile;
//# sourceMappingURL=index.js.map