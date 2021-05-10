export * as es from "estree";
export type THandler = (
	compiler: Compiler,
	scope: IScope,
	node: any,
	arg: any
) => TValueInstructions;

import { Compiler } from "./Compiler";
import { AddressResolver } from "./instructions";
import {
	AssignementOperator,
	BinaryOperator,
	LogicalOperator,
	UnaryOperator,
	UpdateOperator,
} from "./operators";

export interface IInstruction {
	hidden: boolean;
	resolve(i: number): void;
}

export interface IScope {
	breakAddressResolver: AddressResolver;
	continueAddressResolver: AddressResolver;
	tempIndex: number;
	createScope(): IScope;
	createFunction(stacked?: boolean): IScope;
	has(name: string): boolean;
	get(name: string): TValue;
	set(name: string, value: TValue): TValue;
	make(name: string, storeName: string): TValue;
}

export type TValue = { [k in UnaryOperator]?: (scope: IScope) => TValueInstructions } &
	{ [k in UpdateOperator]?: (scope: IScope, prefix: boolean) => TValueInstructions } &
	{
		[k in BinaryOperator | AssignementOperator | LogicalOperator]?: (
			scope: IScope,
			value: TValue
		) => TValueInstructions;
	} & {
		scope: IScope;
		constant: boolean;
		eval(scope: IScope): TValueInstructions;
		call(scope: IScope, args: TValue[]): TValueInstructions;
		get(scope: IScope, name: TValue): TValueInstructions;
	};

export type TValueInstructions = [TValue, IInstruction[]];
