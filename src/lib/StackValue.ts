import { IValue, IScope, TResLines, NumericalValue } from ".";


export class StackValue extends NumericalValue {
	serialize(): string {
		throw new Error("Method not implemented.");
	}
	evaluate(scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	
}
