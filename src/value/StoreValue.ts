import { IValue, Value } from ".";
import { IScope } from "../core";
import { SetLine, TResLines } from "../line";


export class StoreValue extends Value {
	data: {"std::storeValue" : string}
	constructor(scope: IScope, name: string) {
		super(scope)
		this.data["std::storeValue"] = name
	}


		toString(): string {
			return this.data["std::storeValue"];
		}
		evaluate(scope: IScope): TResLines {
			return [this, []];
		}

		assign(scope: IScope, value: IValue): TResLines {
			if (value) {
				value.evaluate(scope);
				this.data["std::storeValue"] = this.data["std::storeValue"];
				return [this, []];
			}
			const [res, lines] = value.evaluate(scope);
			return [this, [...lines, new SetLine(this, res)]];
		}
}

export class TemporaryValue extends StoreValue {
	constructor(scope: IScope) {
		const name = `$acc${scope.accIndex}`;
		super(scope, name);
		this.scope.accIndex++;
	}
}