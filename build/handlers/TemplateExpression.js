"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateLiteral = void 0;
const instructions_1 = require("../instructions");
const TemplateLiteral = (c, scope, node) => {
    const args = [];
    const inst = [];
    node.expressions.forEach((expression, i) => {
        const [v, vi] = c.handleEval(scope, expression);
        inst.push(...vi);
        args.push(node.quasis[i].value.raw, v);
    });
    args.push(node.quasis.slice(-1)[0].value.raw);
    inst.push(new instructions_1.ZeroSpaceInstruction(...args));
    return [null, inst];
};
exports.TemplateLiteral = TemplateLiteral;
//# sourceMappingURL=TemplateExpression.js.map