import Value from "./value/Value";

export type TLine = (string | Value)[];

export type TResLines = [Value, TLine[]];

export enum EOperation {
	Equal = "equal",
	NotEqual = "notEqual",
	LessThan = "lessThan",
	GreaterThan = "greaterThan",
	LessThanEqual = "lessThanEq",
	GreaterThanEqual = "greaterThanEq",
	Add = "add",
	Subtract = "sub",
	Multiply = "mul",
	Divide = "div",
	Modulus = "mod",
	Pow = "pow",
	LogicalAnd = "land",
	BitwiseOr = "or",
	BitwiseAnd = "and",
	BitwiseXor = "xor",
	BitwiseShiftRight = "shr",
	BitwiseShiftLeft = "shl",
	LogicalNot = "not",
	BitwiseNot = "flip"
}
