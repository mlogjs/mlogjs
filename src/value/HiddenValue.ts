import ValueBase from "./ValueBase";

export default class HiddenValue extends ValueBase {
	object: object;
	constructor( object: object) {
		super();
		this.object = object;
	}
}
