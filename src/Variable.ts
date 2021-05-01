class Variable {
	name: string;

	constructor(name: string) {
		this.name = name;
	}

	get() {}
	set(value) {}
	getMember() {}
	setMember() {}
	call() {}

    add(){}

}

class StoreVariable extends Variable {
	constructor(name: string) {
		super(name);
	}
}

class StackVariable extends Variable {
	i: number;
	constructor(name: string, i: number) {
		super(name);
		this.i = i;
	}
}

class ParamVariable extends Variable {
	i: number;
	constructor(name: string, i: number) {
		super(name);
		this.i = i;
	}
}

class AliasVariable extends Variable {
	alias: number | string;
	constructor(name: string, alias: number | string) {
		super(name);
		this.alias = alias;
	}
}

class HiddenVariable extends Variable {
	object: object;
	constructor(name: string, object: object) {
		super(name);
		this.object = object;
	}
}
