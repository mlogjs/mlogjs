import Scope from "../Scope";
import { TResLines } from "../types";
import Value from "./Value";

export default class Stacked extends Value {
	serialize(scope: Scope): string {
		throw new Error("Method not implemented.");
	}
	evaluate(scope: Scope): TResLines {
		throw new Error("Method not implemented.");
	}
	getMember(scope: Scope, index: Value, value: Value): TResLines {
		throw new Error("Method not implemented.");
	}
	getComputedMember(scope: Scope, index: Value, value: Value): TResLines {
		throw new Error("Method not implemented.");
	}
	call(scope: Scope, args: Value[]): TResLines {
		throw new Error("Method not implemented.");
	}
	assign(scope: Scope, value: Value): TResLines {
		throw new Error("Method not implemented.");
	}
	

}
