import { IScope, IBindableValue, TLiteral, TValueInstructions } from "../types";
import { BaseValue } from ".";
import { BinaryOperator, LogicalOperator, UnaryOperator } from "../operators";


export class LiteralValue extends BaseValue implements IBindableValue {
	data: TLiteral;
	constant = true
	constructor(scope: IScope, data: TLiteral) {
		super(scope);
		this.data = data;
	}
	eval(scope: IScope): TValueInstructions {
		return [this, []];
	}
	toString() {
		return JSON.stringify(this.data);
	}
	get num() {
		if (this.data === null) return 0;
		if (typeof this.data === "string") return 1;
		return this.data;
	}
}

type TOperationFn = (a: number, b?: number) => number;

const operatorMap: { [k in BinaryOperator | LogicalOperator]?: TOperationFn } = {
	"==": (a, b) => +(a == b),
	"===": (a, b) => +(a === b),
	"!=": (a, b) => +(a != b),
	"!==": (a, b) => +(a !== b),
	"<": (a, b) => +(a < b),
	">": (a, b) => +(a > b),
	"<=": (a, b) => +(a <= b),
	">=": (a, b) => +(a >= b),
	"+": (a, b) => a + b,
	"-": (a, b) => a - b,
	"*": (a, b) => a * b,
	"/": (a, b) => a / b,
	"%": (a, b) => a % b,
	"**": (a, b) => a ** b,
	"|": (a, b) => a | b,
	"&": (a, b) => a & b,
	"^": (a, b) => a ^ b,
	">>": (a, b) => a >> b,
	">>>": (a, b) => a >> b,
	"<<": (a, b) => a << b,
	"&&": (a, b) => +(a && b),
	"||": (a, b) => +(a || b),
} as const;

for (const key in operatorMap) {
	const fn = operatorMap[key] as TOperationFn;
	LiteralValue.prototype[key] = function (
		this: LiteralValue,
		scope: IScope,
		value: LiteralValue
	): TValueInstructions {
		if (!(value instanceof LiteralValue)) {
			console.log(this, "using super method because not instance of LiteralValue", value)
			return BaseValue.prototype[key](scope, value)
		};
		return [new LiteralValue(scope, fn(this.num, value.num)), []];
	};
}

const unaryOperatorMap: { [k in UnaryOperator]?: TOperationFn } = {
	"!": (v) => +!v,
	"~": (v) => ~v,
	"u-": (v) => -v,
} as const;

for (const key in unaryOperatorMap) {
	LiteralValue.prototype[key] = function (this: LiteralValue, scope: IScope): TValueInstructions {
		const fn = operatorMap[key] as TOperationFn;
		return [new LiteralValue(scope, fn(this.num)), []];
	};
}
