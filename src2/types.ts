import {
	AssignementOperator,
	BinaryOperator,
	LogicalOperator,
	UnaryOperator,
	UpdateOperator,
} from "./operators";
import { Scope } from "./Scope";



export type TValue = { [k in BinaryOperator | AssignementOperator | LogicalOperator]?: () => TValue } &
	{ [k in UpdateOperator | UnaryOperator]?: () => TValue } & {
		data: { [k: string]: any };
		constant: boolean;
        scope: Scope
	};
