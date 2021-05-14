"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionExpression = exports.FunctionDeclaration = exports.ArrowFunctionExpression = void 0;
const utils_1 = require("../utils");
const FunctionValue_1 = require("../values/FunctionValue");
const ArrowFunctionExpression = (c, scope, node) => {
    const name = utils_1.nodeName(node);
    scope = scope.createFunction(name);
    let { params, body } = node;
    if (node.expression) {
        body = {
            type: "BlockStatement",
            body: [{ type: "ReturnStatement", argument: body }],
        };
    }
    const paramNames = [];
    const paramStores = [];
    for (const id of params) {
        paramNames.push(id.name);
        paramStores.push(scope.make(id.name, utils_1.nodeName(id)));
    }
    return [
        new FunctionValue_1.FunctionValue(scope, name, paramNames, paramStores, body, c),
        [],
    ];
};
exports.ArrowFunctionExpression = ArrowFunctionExpression;
const FunctionDeclaration = (c, scope, node) => {
    return [scope.set(node.id.name, exports.ArrowFunctionExpression(c, scope, node, null)[0]), []];
};
exports.FunctionDeclaration = FunctionDeclaration;
exports.FunctionExpression = exports.ArrowFunctionExpression;
//# sourceMappingURL=Function.js.map