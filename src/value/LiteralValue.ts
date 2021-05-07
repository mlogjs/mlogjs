import { MindustryValue } from ".";
import { IScope } from "../core";
import {  Literal } from "../partial/Literal";
import { TLiteral } from "../types";
export class LiteralValue extends Literal(MindustryValue) {
	data: number | string;
	constructor(scope: IScope, data: TLiteral) {
		super(scope);
		this.data = data;
	}
}
