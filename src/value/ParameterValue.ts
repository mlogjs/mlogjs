import ValueBase from "./ValueBase";

export default class ParameterValue extends ValueBase {
	i: number;
	constructor( i: number) {
		super();
		this.i = i;
	}
}