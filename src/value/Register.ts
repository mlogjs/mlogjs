import  Scope from "../Scope";
import { TResLines } from "../types";
import Accumulator from "./Accumulator";
import Value from "./Value";

export default class Register extends Value {
	scope: Scope
	name: string;

	constructor(scope: Scope, name: string) {
		super()
		this.scope = scope
		this.name = name;
	}

	serialize(scope: Scope): string {
		return this.name + "__" + scope.name
	}
	evaluate(scope: Scope): TResLines {
		return [this, []]
	}
	assign(scope: Scope, value: Value): TResLines {
		if (value instanceof Accumulator) {
			value.evaluate(scope)
			value.name = this.name
			return [this, []]
		}
		const [res, lines] = value.evaluate(scope)
		return [this, [...lines, ["set", this, res]]]
	}
}
