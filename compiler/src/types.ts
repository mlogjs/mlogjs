export * as es from "estree";
import * as es from "estree";
import { Compiler } from "./Compiler";
import { AddressResolver } from "./instructions";
import { MacroFunction } from "./macros";
import { LeftRightOperator, UnaryOperator, UpdateOperator } from "./operators";
export interface IInstruction {
  hidden: boolean;
  resolve(i: number): void;
}

export type THandler = (
  compiler: Compiler,
  scope: IScope,
  node: any,
  arg: any
) => TValueInstructions;

export interface IScope {
  parent: IScope;
  data: {};
  name: string;
  inst: IInstruction[];
  break: AddressResolver;
  continue: AddressResolver;
  function: IFunctionValue;
  ntemp: number;
  createScope(): IScope;
  createFunction(name: string, stacked?: boolean): IScope;
  has(name: string): boolean;
  get(name: string): IValue;
  set(name: string, value: IValue): IValue;
  hardSet(name: string, value: IValue): IValue;
  make(name: string, storeName: string): IValue;
  copy(): IScope;
}

// we can't use type maps to define actual methods
// and if we don't do this we'll get an error [ts(2425)]
export interface IValue {
  // main properties
  scope: IScope;
  constant: boolean;
  macro: boolean;
  eval(scope: IScope): TValueInstructions;
  call(scope: IScope, args: IValue[]): TValueInstructions<IValue | null>;
  get(scope: IScope, name: IValue): TValueInstructions;

  // unary operators
  "!"(scope: IScope): TValueInstructions;
  "u+"(scope: IScope): TValueInstructions;
  "u-"(scope: IScope): TValueInstructions;
  "delete"(scope: IScope): TValueInstructions;
  "typeof"(scope: IScope): TValueInstructions;
  "void"(scope: IScope): TValueInstructions;
  "~"(scope: IScope): TValueInstructions;

  // update operators
  "++"(scope: IScope, prefix: boolean): TValueInstructions;
  "--"(scope: IScope, prefix: boolean): TValueInstructions;

  // left right operators
  "*"(scope: IScope, value: IValue): TValueInstructions;
  "**"(scope: IScope, value: IValue): TValueInstructions;
  "+"(scope: IScope, value: IValue): TValueInstructions;
  "-"(scope: IScope, value: IValue): TValueInstructions;
  "/"(scope: IScope, value: IValue): TValueInstructions;
  "%"(scope: IScope, value: IValue): TValueInstructions;
  "!="(scope: IScope, value: IValue): TValueInstructions;
  "!=="(scope: IScope, value: IValue): TValueInstructions;
  "<"(scope: IScope, value: IValue): TValueInstructions;
  "<="(scope: IScope, value: IValue): TValueInstructions;
  "=="(scope: IScope, value: IValue): TValueInstructions;
  "==="(scope: IScope, value: IValue): TValueInstructions;
  ">"(scope: IScope, value: IValue): TValueInstructions;
  ">="(scope: IScope, value: IValue): TValueInstructions;
  "&"(scope: IScope, value: IValue): TValueInstructions;
  "<<"(scope: IScope, value: IValue): TValueInstructions;
  ">>"(scope: IScope, value: IValue): TValueInstructions;
  ">>>"(scope: IScope, value: IValue): TValueInstructions;
  "^"(scope: IScope, value: IValue): TValueInstructions;
  "|"(scope: IScope, value: IValue): TValueInstructions;
  instanceof(scope: IScope, value: IValue): TValueInstructions;
  in(scope: IScope, value: IValue): TValueInstructions;
  "&&"(scope: IScope, value: IValue): TValueInstructions;
  "??"(scope: IScope, value: IValue): TValueInstructions;
  "||"(scope: IScope, value: IValue): TValueInstructions;
  "%="(scope: IScope, value: IValue): TValueInstructions;
  "&="(scope: IScope, value: IValue): TValueInstructions;
  "*="(scope: IScope, value: IValue): TValueInstructions;
  "**="(scope: IScope, value: IValue): TValueInstructions;
  "+="(scope: IScope, value: IValue): TValueInstructions;
  "-="(scope: IScope, value: IValue): TValueInstructions;
  "/="(scope: IScope, value: IValue): TValueInstructions;
  "&&="(scope: IScope, value: IValue): TValueInstructions;
  "||="(scope: IScope, value: IValue): TValueInstructions;
  "<<="(scope: IScope, value: IValue): TValueInstructions;
  ">>="(scope: IScope, value: IValue): TValueInstructions;
  ">>>="(scope: IScope, value: IValue): TValueInstructions;
  "^="(scope: IScope, value: IValue): TValueInstructions;
  "|="(scope: IScope, value: IValue): TValueInstructions;
  "="(scope: IScope, value: IValue): TValueInstructions;
}

export type TLiteral = string | number;
export interface IBindableValue extends IValue {
  data: TLiteral;
}

export interface IFunctionValue extends IValue {
  return(scope: IScope, argument: IValue): TValueInstructions;
}

export type TValueInstructions<Content extends IValue | null = IValue> = [
  Content,
  IInstruction[]
];

export type TOperatorMacroMap = {
  [K in UnaryOperator | UpdateOperator | LeftRightOperator]?: MacroFunction;
};
