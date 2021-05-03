import ValueBase, { TResLines } from "./ValueBase";

export default class LiteralValue extends ValueBase {
	data: string | number;
	constructor(data: string | number) {
		super();
		this.data = data;
	}
	serialize() {
		return JSON.stringify(this.data);
	}
	get(): TResLines {
		return [this, []];
	}
}
