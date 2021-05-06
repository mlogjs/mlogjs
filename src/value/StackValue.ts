import { NumericalValue } from ".";
import { IScope } from "../core";
import { TResLines } from "../line";



export class StackValue extends NumericalValue {
	serialize(): string {
		throw new Error("Method not implemented.");
	}
	evaluate(scope: IScope): TResLines {
		throw new Error("Method not implemented.");
	}
	
}
