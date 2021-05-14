import { InstructionBase, OperationInstruction } from "../instructions";
import { IScope, IValue } from "../types";
import { LiteralValue, ObjectValue, TempValue } from "../values";
import { MacroFunction } from "./Function";

const mathOperations: { [k: string]: (a: number, b?: number) => number } = {
	max: (a, b) => Math.max(a, b),
	min: (a, b) => Math.min(a, b),
	angle: (a, b) => Math.atan2(a, b),
	len: (a, b) => Math.sqrt(a ** 2 + b ** 2),
	noise: null,
	abs: (a) => Math.abs(a),
	log: (a) => Math.log(a),
	log10: (a) => Math.log(a) / Math.log(10),
	sin: (a) => Math.sin(a),
	cos: (a) => Math.cos(a),
	tan: (a) => Math.tan(a),
	floor: (a) => Math.floor(a),
	ceil: (a) => Math.ceil(a),
	sqrt: (a) => Math.ceil(a),
	rand: null,
};

function createMacroMathOperations (scope: IScope) {

    const macroMathOperations = {}
    for (const key in mathOperations) {
        const fn = mathOperations[key]
        macroMathOperations[key] = new MacroFunction(scope, (a, b) => {
            if (fn && a instanceof LiteralValue && b instanceof LiteralValue) {
                if (typeof a.data !== "number" || typeof a.data !== "number") throw new Error("Cannot do math operation with non-numerical literals.")
                return [new LiteralValue(scope, fn(a.num, b.num)), []]
            }
            const temp = new TempValue(scope)
            return [temp, [new OperationInstruction(key, temp, a, b)]]
        })
    }
    return macroMathOperations
}

export class MlogMath extends ObjectValue {
    constructor(scope: IScope) {
        super(scope, createMacroMathOperations(scope))
    }
}

// op angle result a b
// op len result a b
