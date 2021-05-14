"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Program = void 0;
const Scope_1 = require("../Scope");
const Program = (c, scope, node) => {
    return c.handleMany(scope !== null && scope !== void 0 ? scope : new Scope_1.Scope({}), node.body);
};
exports.Program = Program;
//# sourceMappingURL=Program.js.map