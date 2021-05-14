"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeName = void 0;
function nodeName(node) {
    const { line, column } = node.loc.start;
    return line + ":" + column;
}
exports.nodeName = nodeName;
//# sourceMappingURL=utils.js.map