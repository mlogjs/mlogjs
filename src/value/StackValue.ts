import ValueBase from "./ValueBase";

export default class StackValue extends ValueBase {
	i: number;
	memory: string;
	constructor(i: number, memory: string) {
		super();
		this.i = i;
		this.memory = memory;
	}
}
