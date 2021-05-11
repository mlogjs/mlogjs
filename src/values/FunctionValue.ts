import { AddressResolver, EJumpKind, JumpInstruction } from "../instructions";
import { IInstruction, IScope, IValue, TValueInstructions } from "../types";
import { LiteralValue } from "./LiteralValue";
import { StoreValue } from "./StoreValue";
import { VoidValue } from "./VoidValue";

export class FunctionValue extends VoidValue implements VoidValue {
	params: StoreValue[]
	addr: LiteralValue;
	temp: StoreValue;
	ret: StoreValue;
	
	constructor(scope: IScope, params: StoreValue[], addr: LiteralValue, temp: StoreValue, ret: StoreValue) {
		super(scope);
		this.params = params
		this.addr = addr
		this.temp = temp
		this.ret = ret
	}

	call(scope: IScope, args: IValue[]): TValueInstructions {
		if (args.length < this.params.length) throw new Error("Cannot call: missing arguments.")
		const inst: IInstruction[] = []
		this.params.forEach((param, i) => {
			const arg = args[i]
			inst.push(...param["="](scope, arg)[1])
		})
		const callAddressLiteral = new LiteralValue(scope, null)
		const callAddress = new AddressResolver(callAddressLiteral)
		inst.push(
			...this.ret["="](scope, callAddressLiteral)[1],
			new JumpInstruction(this.addr, EJumpKind.Always),
			callAddress
		)
		return [this.temp, inst]
	}

	eval(scope: IScope): TValueInstructions {
		return [this, []]
	}
}
