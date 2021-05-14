export const arithmeticBinaryOperators = ["*", "**", "+", "-", "/", "%"] as const;
export const comparisonBinaryOperators = ["!=", "!==", "<", "<=", "==", "===", ">", ">="] as const;
export const bitwiseBinaryOperators = ["&", "<<", ">>", ">>>", "^", "|"] as const;
export const binaryOperators = [
	...arithmeticBinaryOperators,
	...comparisonBinaryOperators,
	...bitwiseBinaryOperators,
	"instanceof",
	"in",
] as const;
export type BinaryOperator = typeof binaryOperators[number];

export const logicalOperators = ["&&", "??", "||"] as const;
export type LogicalOperator = typeof logicalOperators[number];

export const arithmeticAssignmentOperators = ["%=", "&=", "*=", "**=", "+=", "-=", "/="] as const;
export const logicalAssignmentOperators = ["&&=", "||="] as const
export const bitwiseAssignmentOperators = ["<<=", ">>=", ">>>=", "^=", "|="] as const;
export const assignmentOperators = [
	...arithmeticAssignmentOperators,
	...logicalAssignmentOperators,
	...bitwiseAssignmentOperators,
	"=",
] as const;
export type AssignementOperator = typeof assignmentOperators[number];

export const leftRightOperators = [
    ...binaryOperators,
	...logicalOperators,
	...assignmentOperators
] as const

export type LeftRightOperator = typeof leftRightOperators[number]

export const unaryOperators = ["!", "u+", "u-", "delete", "typeof", "void", "~"] as const;
export type UnaryOperator = typeof unaryOperators[number];

export const updateOperators = ["++", "--"] as const;
export type UpdateOperator = typeof updateOperators[number];

export const singleOperators = [
    ...unaryOperators,
	...updateOperators,
] as const

export type SingleOperator = typeof singleOperators[number]

export const operators = [
	...leftRightOperators,
	...singleOperators
] as const;
export type Operator = typeof operators[number]