import { Compiler } from "../Compiler";
import {
	AddressResolver,
	EJumpKind,
	JumpInstruction,
	SetCounterInstruction,
} from "../instructions";
import { es, IFunctionValue, IInstruction, IScope, IValue, TValueInstructions } from "../types";
import { LiteralValue } from "./LiteralValue";
import { StoreValue } from "./StoreValue";
import { TempValue } from "./TempValue";
import { VoidValue } from "./VoidValue";

export class FunctionValue extends VoidValue implements IFunctionValue {
	paramStores: StoreValue[];
	paramNames: string[];
	inst: IInstruction[];
	addr: LiteralValue;
	temp: StoreValue;
	ret: StoreValue;
	inline: boolean;
	body: es.BlockStatement;
	name: string;
	c: Compiler;
	constant = true;
	macro = true;
	count: number = 0;
	callSize: number;
	bodySize: number;
	inlineTemp: TempValue;

	protected createValues() {
		this.addr = new LiteralValue(this.scope, null);
		this.temp = new StoreValue(this.scope, "f" + this.name);
		this.ret = new StoreValue(this.scope, "r" + this.name);
	}

	protected createInst() {
		this.inst = [new AddressResolver(this.addr), ...this.c.handle(this.scope, this.body)[1]];
		const last = this.inst.slice(-1)[0];
		if (!(last instanceof SetCounterInstruction) || last.args[2] !== this.ret) {
			this.inst.push(new SetCounterInstruction(this.ret));
		}
		this.bodySize = this.inst.length;
	}

	constructor(
		scope: IScope,
		name: string,
		paramNames: string[],
		paramStores: StoreValue[],
		body: es.BlockStatement,
		c: Compiler
	) {
		super(scope);

		this.name = name;
		this.paramNames = paramNames;
		this.paramStores = paramStores;
		this.body = body;
		this.c = c;

		this.callSize = paramStores.length + 2;
		scope.function = this;

		this.createValues();
		this.createInst();
	}

	protected normalReturn(scope: IScope, arg: IValue): TValueInstructions {
		const argInst = arg ? this.temp["="](scope, arg)[1] : [];
		return [null, [...argInst, new SetCounterInstruction(this.ret)]];
	}

	protected normalCall(scope: IScope, args: IValue[]): TValueInstructions {
		this.scope.inst.push(...this.inst);
		const callAddressLiteral = new LiteralValue(scope, null);
		const inst: IInstruction[] = this.paramStores
			.map((param, i) => param["="](scope, args[i])[1])
			.reduce((s, c) => s.concat(c), [])
			.concat(
				...this.ret["="](scope, callAddressLiteral)[1],
				new JumpInstruction(this.addr, EJumpKind.Always),
				new AddressResolver(callAddressLiteral)
			);
		return [this.temp, inst];
	}

	protected inlineReturn(scope: IScope, arg: IValue): TValueInstructions {
		const argInst = arg ? this.inlineTemp["="](scope, arg)[1] : [];
		const fnEnd = new LiteralValue(scope, null);
		return [
			null,
			[...argInst, new JumpInstruction(fnEnd, EJumpKind.Always), new AddressResolver(fnEnd)],
		];
	}

	protected inlineCall(scope: IScope, args: IValue[]): TValueInstructions {
		const fnScope = this.scope.copy();
		args.forEach((arg, i) => fnScope.hardSet(this.paramNames[i], arg));
		this.inlineTemp = new TempValue(scope);
		const old = this.inline
		this.inline = true
		const vi = this.c.handle(fnScope, this.body)[1]
		this.inline = old
		return [this.inlineTemp, vi];
	}

	call(scope: IScope, args: IValue[]): TValueInstructions {
		if (args.length < this.paramStores.length)
			throw new Error("Cannot call: missing arguments.");
		const inlineCall = this.inlineCall(scope, args)
		const inlineSize = inlineCall[1].filter(i=>!i.hidden).length
		if (this.inline || inlineSize <= this.callSize) return inlineCall
		return this.normalCall(scope, args);
	}

	return(scope: IScope, arg: IValue): TValueInstructions {
		if (arg && arg.macro) {
			this.inline = true;
			return [null, []]
		}
		if (this.inline) return this.inlineReturn(scope, arg);
		return this.normalReturn(scope, arg);
	}

	eval(scope: IScope): TValueInstructions {
		return [this, []];
	}
}
