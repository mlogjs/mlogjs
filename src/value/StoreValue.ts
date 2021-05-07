import { MindustryValue } from ".";
import { IScope } from "../core";
import { Storable, TemporaryStorable } from "../partial/Storable";


export class StoreValue extends Storable(MindustryValue) {
	name: string;
	constructor(scope: IScope, name: string) {
		super(scope)
		this.name = name;
	}
}

export class TemporaryValue extends TemporaryStorable(MindustryValue) {
	constructor(scope: IScope) {
		const name = `$acc${scope.accIndex}`;
		super(scope, name);
		this.scope.accIndex++;
	}
}