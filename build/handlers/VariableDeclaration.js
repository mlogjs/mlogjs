"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariableDeclarator = exports.VariableDeclaration = void 0;
const utils_1 = require("../utils");
const VariableDeclaration = (c, scope, node) => {
    return c.handleMany(scope, node.declarations, (scope, child) => exports.VariableDeclarator(c, scope, child, node.kind));
};
exports.VariableDeclaration = VariableDeclaration;
const VariableDeclarator = (c, scope, node, kind = "let") => {
    let valinst = node.init ? c.handleEval(scope, node.init) : [null, []];
    const { name } = node.id;
    const [init] = valinst;
    if (kind === "const" && !init)
        throw Error("Cannot create constant with void value.");
    if (kind === "const" && init.constant) {
        scope.set(name, init);
        return [init, []];
    }
    else {
        const value = scope.make(name, utils_1.nodeName(node));
        if (init) {
            if (init.macro)
                throw new Error("Macro value must be constant.");
            valinst[1].push(...value["="](scope, valinst[0])[1]);
        }
        if (kind === "const")
            value.constant = true;
        return valinst;
    }
};
exports.VariableDeclarator = VariableDeclarator;
//# sourceMappingURL=VariableDeclaration.js.map