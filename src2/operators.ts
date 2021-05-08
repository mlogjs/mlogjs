export const ArithmeticBinaryOperators = ["*", "**", "+", "-", "/", "%"] as const;
export const ComparisonBinaryOperators = ["!=", "!==", "<", "<=", "==", "===", ">", ">="] as const;
export const BitwiseBinaryOperators = ["&", "<<", ">>", ">>>", "^", "|"] as const;
export type BinaryOperator =
	| typeof ArithmeticBinaryOperators[number]
	| typeof ComparisonBinaryOperators[number]
	| typeof BitwiseBinaryOperators[number]
	| "instanceof"
	| "in";

export const LogicalOperators = ["&&", "??", "||"] as const;
export type LogicalOperator = typeof LogicalOperators[number];

export const ArithmeticAssignmentOperators = ["%=", "&=", "=", "**=", "+=", "-=", "/="] as const;
export const BitwiseAssignmentOperators = ["<<=", ">>=", ">>>=", "^=", "|="] as const;
export type AssignementOperator =
	| typeof ArithmeticAssignmentOperators[number]
	| typeof BitwiseAssignmentOperators[number]
	| "=";

export const UnaryOperators = ["!","u+","u-","delete","typeof","void","~"] as const
export type UnaryOperator = typeof UnaryOperators[number]

export type UpdateOperator = "++" | "--";
