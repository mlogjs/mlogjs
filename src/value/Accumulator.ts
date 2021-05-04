import Scope from "../Scope";
import { TResLines } from "../types";
import Register from "./Register";

export default class Accumulator extends Register {
	constructor(scope: Scope) {
		const name = `$acc${scope.accIndex}`;
		super(scope, name);
		this.scope.accIndex++;
	}
	evaluate(scope: Scope): TResLines {
		this.scope.accIndex--;
		return [new Register(this.scope, this.name), []];
	}
}
