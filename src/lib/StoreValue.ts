import { IValue, IScope, TResLines, NumericalValue} from ".";

export class StoreValue extends NumericalValue {
	scope: IScope
	name: string;

	constructor(scope: IScope, name: string) {
		super()
		this.scope = scope
		this.name = name;
	}
	serialize(): string {
		return this.name + this.scope.name
	}
	evaluate(scope: IScope): TResLines {
		return [this, []]
	}
	assign(scope: IScope, value: IValue): TResLines {
		if (value instanceof TemporaryValue) {
			value.evaluate(scope)
			value.name = this.name
			return [this, []]
		}
		const [res, lines] = value.evaluate(scope)
		return [this, [...lines, ["set", this, res]]]
	}
}

export class TemporaryValue extends StoreValue {
	constructor(scope: IScope) {
		const name = `$acc${scope.accIndex}`;
		super(scope, name);
		this.scope.accIndex++;
	}
	evaluate(scope: IScope): TResLines {
		this.scope.accIndex--;
		return [new StoreValue(this.scope, this.name), []];
	}
}