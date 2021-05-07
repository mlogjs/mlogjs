import { TValueConstructor } from ".";
import { IValue } from "../value";
import { IScope } from "../core";
import { SetLine, TResLines } from "../line";

export function Storable<B extends TValueConstructor>(Base: B): TValueConstructor {
	return class Storable extends Base {
		name: string;
		isAccumulator: boolean = false;

		toString(): string {
			return this.name;
		}
		evaluate(scope: IScope): TResLines {
			return [this, []];
		}

		assign(scope: IScope, value: IValue): TResLines {
			if (value instanceof Storable && (<Storable>value).isAccumulator) {
				value.evaluate(scope);
				(<Storable>value).name = this.name;
				return [this, []];
			}
			const [res, lines] = value.evaluate(scope);
			return [this, [...lines, new SetLine(this, res)]];
		}
	};
}

export function TemporaryStorable<B extends TValueConstructor>(Base: B): TValueConstructor {
	return class TemporaryStorable extends Storable(Base) {
		isAccumulator: boolean = true;
	};
}