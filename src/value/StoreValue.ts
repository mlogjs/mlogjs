import LiteralValue from "./LiteralValue";
import ValueBase, { TResLines } from "./ValueBase";

export default class StoreValue extends ValueBase {
	name: string;
	constructor(name: string) {
		super();
		this.name = name;
	}
	serialize() {
		return this.name;
	}
	get(): TResLines {
		return [this, []];
	}
	set(value: ValueBase): TResLines {
		const [res, lines] = value.get();
		return [this, [...lines, ["set", this, res]]];
	}

	private makeOpResLines(opName: string, value?: ValueBase): TResLines{
		const [res, lines] = value?.get() || [];
		return [this, [...lines, ["op", opName, this, this, res]]];
	}

	add(value: ValueBase) {
		return this.makeOpResLines("add", value)
	}
	sub(value: ValueBase) {
		return this.makeOpResLines("sub", value)
	}
	mul(value: ValueBase) {
		return this.makeOpResLines("mul", value)
	}
	div(value: ValueBase) {
		return this.makeOpResLines("div", value)
	}
	pow(value: ValueBase) {
		return this.makeOpResLines("pow", value)
	}
	inc() {
		return this.makeOpResLines("pow", new LiteralValue(1))
	}
	dec() {
		return this.makeOpResLines("pow", new LiteralValue(1))
	}

	and(value: ValueBase) {
		return this.makeOpResLines("and", value)
	}
	or(value: ValueBase) {
		return this.makeOpResLines("or", value)
	}
}
