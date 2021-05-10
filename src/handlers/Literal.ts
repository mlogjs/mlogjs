import { THandler, es } from "../types";
import { LiteralValue, TLiteral } from "../values";

export const Literal: THandler = (c, scope, node: es.Literal) => {
	const { value } = node;
	if (value === null || typeof value === "string" || typeof value === "number") {
		return [new LiteralValue(scope, value as TLiteral), []];
	}
	if (typeof value === "boolean") {
		return [new LiteralValue(scope, +value), []];
	}
	throw Error("Cannot create literal " + typeof value);
};
