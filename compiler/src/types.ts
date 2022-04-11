export * as es from "@babel/types";
import { Compiler } from "./Compiler";
import { AddressResolver } from "./instructions";
import { MacroFunction } from "./macros";
import { LeftRightOperator, UnaryOperator, UpdateOperator } from "./operators";
import { StoreValue } from "./values";
export interface IInstruction {
  hidden: boolean;
  resolve(i: number): void;
}

export type THandler<T extends IValue | null = IValue> = (
  compiler: Compiler,
  scope: IScope,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arg: any
) => TValueInstructions<T>;

export interface IScope {
  parent: IScope | null;
  data: Record<string, IValueOwner | null>;
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
  set<T extends IValue>(name: string, value: T): T;
  set<T extends IValue>(owner: IValueOwner<T>): T;
  hardSet<T extends IValue>(name: string, value: T): T;
  hardSet<T extends IValue>(owner: IValueOwner<T>): T;
  make(name: string, storeName: string): StoreValue;
  copy(): IScope;
  makeTempName(): string;
  formatName(name: string): string;
}

export interface IValueOwner<T extends IValue = IValue> {
  scope: IScope;
  constant: boolean;
  value: T;
  identifier?: string;
  name: string;
  temporary: boolean;
  own(target: T): void;
  replace(target: T): void;
  /** Moves all values owned by `this` into `owner` */
  moveInto(owner: IValueOwner<T>): void;
}
// we can't use type maps to define actual methods
// and if we don't do this we'll get an error [ts(2425)]
export interface IValueOperators {
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

export interface IValue extends IValueOperators {
  // main properties
  owner: IValueOwner | null;
  scope: IScope;
  constant: boolean;
  macro: boolean;
  /**
   * Evaluates `this`, returning it's representation in a more basic
   * value like `StoreValue` with the instructions required to compute that value
   */
  eval(scope: IScope): TValueInstructions;
  /**
   * Does the same thing as {@link IValue.eval eval}, but ensures that the resulting value has an owner.
   *
   * This behaviour is required when dealing with temporary values inside expressions like comparations.
   */
  consume(scope: IScope): TValueInstructions;
  call(scope: IScope, args: IValue[]): TValueInstructions<IValue | null>;
  get(scope: IScope, name: IValue): TValueInstructions;
  ensureOwned(): asserts this is IOwnedValue;
}
/** Helper type that is used in some typescript assertions */
export interface IOwnedValue extends IValue {
  owner: Exclude<IValue["owner"], null>;
}

export type TLiteral = string | number;
export interface IBindableValue extends IValue {
  data: TLiteral;
}

export interface IFunctionValue extends IValue {
  return(
    scope: IScope,
    argument: IValue | null
  ): TValueInstructions<IValue | null>;
}

export type TValueInstructions<Content extends IValue | null = IValue> = [
  Content,
  IInstruction[]
];

export type TOperatorMacroMap = {
  [K in
    | UnaryOperator
    | UpdateOperator
    | LeftRightOperator as `$${K}`]?: MacroFunction;
};
