"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Draw = void 0;
const instructions_1 = require("../instructions");
const values_1 = require("../values");
const Function_1 = require("./Function");
class Draw extends Function_1.MacroFunction {
    constructor(scope) {
        super(scope, (kind, ...args) => {
            if (!(kind instanceof values_1.LiteralValue))
                throw new Error("Draw kind must be literal.");
            if ([
                "clear",
                "color",
                "stroke",
                "line",
                "rect",
                "lineRect",
                "poly",
                "linePoly",
                "triangle",
                "image",
            ].indexOf(kind.data) === -1)
                throw new Error("Draw kind must be valid");
            return [null, [new instructions_1.InstructionBase("draw", kind.data, ...args.map(v => {
                        if (v instanceof values_1.LiteralValue && typeof v.data === "string")
                            return v.data;
                        return v;
                    }))]];
        });
    }
}
exports.Draw = Draw;
//# sourceMappingURL=Draw.js.map