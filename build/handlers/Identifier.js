"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Identifier = void 0;
const Identifier = (c, scope, node) => {
    return [scope.get(node.name), []];
};
exports.Identifier = Identifier;
//# sourceMappingURL=Identifier.js.map