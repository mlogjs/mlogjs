"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewExpression = exports.CallExpression = void 0;
const CallExpression = (c, scope, node) => {
    const inst = [];
    const args = node.arguments.map(node => {
        const [v, i] = c.handleEval(scope, node);
        inst.push(...i);
        return v;
    });
    const [callee, calleeInst] = c.handleEval(scope, node.callee);
    inst.push(...calleeInst);
    const [callValue, callInst] = callee.call(scope, args);
    inst.push(...callInst);
    return [callValue, inst];
};
exports.CallExpression = CallExpression;
exports.NewExpression = exports.CallExpression;
//# sourceMappingURL=CallExpression.js.map