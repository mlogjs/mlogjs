export * as es from "@babel/types";
import * as es from "@babel/types";
import { Compiler } from "./Compiler";
import { AddressResolver } from "./instructions";
import { MacroFunction } from "./macros";
import { LeftRightOperator, UnaryOperator, UpdateOperator } from "./operators";

export enum EInstIntent {
  none,
  break,
  continue,
  return,
  /**
   * This is used by the `end` and `stop` instructions.
   * Means that the processor will restart or shutdown.
   */
  exit,
}

export interface IInstruction {
  intent: EInstIntent;
  /**
   * Used by function values to check if a return instruction
   * originates from them or other function.
   */
  intentSource?: IValue;
  hidden: boolean;
  resolve(i: number): void;
  source?: es.SourceLocation;
  /**
   * Helps analyzing control flow, handlers should
   * indicate which instructions returned are guaranteed to run
   */
  alwaysRuns: boolean;
}

/**
 * The expression output, either a value or a value name.
 *
 * Knowing the output variable can be beneficial for static optimizations.
 *
 * A string means that the handler should create a value with the given name.
 *
 * An IValue means that the handler should try to use `this` as the output value.
 */
export type TEOutput = IValue | string;

export type THandler<T extends IValue | null = IValue> = (
  compiler: Compiler,
  scope: IScope,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any,
  out: TEOutput | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arg: any
) => TValueInstructions<T>;

/**
 * The scope manages the source code generated variables and their owners,
 * as well as break and continue statements and they also work as function
 * bodies.
 */
export interface IScope {
  /** Every scope except the top level one has a parent */
  parent: IScope | null;
  /** The registry of variables contained by this scope */
  data: Record<string, IValue | null>;
  name: string;
  /**
   * Additional instructions required by this scope, such as
   * the instructions that make the body of a function
   */
  inst: IInstruction[];
  /** The label applied to this scope */
  label?: string;
  /** Where to jump to on a break statement */
  break: AddressResolver;
  /** Where to jump to on a continue statement */
  continue: AddressResolver;
  /** The function linked to `this`, is `null` when the scope is not inside a function. */
  function: IFunctionValue;
  /** Counts the number of temp variables generated during compilaton */
  ntemp: number;

  /**
   * A record of the cached value operations, maps the id
   * of an operation to a previously computed value.
   */
  operationCache: Record<string, IValue>;

  /** Tracks the dependency relation beteween values and cached operations */
  cacheDependencies: Record<string, string[]>;
  /**
   * Tells array macros whether to check index access performed.
   * This field is mutable.
   */
  checkIndexes: boolean;
  /** Tells values to use short circuiting on their logical operators.  */
  shortCircuitOperators: boolean;
  /**
   * Creates a new scope that has `this` as it's parent.
   */
  createScope(): IScope;
  /**
   * Creates a new scope to be used by a function value, the scope has the following properties:
   * - uses `name` as it's primary name, it changes how variable names are formatted.
   * - it has `this` as it's parent
   * - independent variable registry
   * @param name The name of the scope
   * @param stacked
   */
  createFunction(name: string, stacked?: boolean): IScope;
  /** Checks if there is an owner registered with the specified identifier */
  has(identifier: string): boolean;
  /** Gets a value by their owner's identifier */
  get(identifier: string): INamedValue;
  /**
   * Registers `value` with an owner that uses `name` as both it's name and identifier,
   * throws an error if there already is an owner with the same identitifer.
   * @param name
   * @param value
   */
  set<T extends IValue>(name: string, value: T): T;
  /**
   * Registers `value` with an owner that uses `name` as both it's name and identifier,
   * overriding any preexisting variables with the same identifier.
   * @param name
   * @param value
   */
  hardSet<T extends IValue>(name: string, value: T): T;
  /**
   * Creates an owned store and registers it to this scope.
   * @param identifier The name of the variable that will hold the store
   * @param name The mlog name that the owner will have
   */
  make(identifier: string, name: string): IValue;
  /**
   * Creates a shallow copy of this scope.
   *
   * Be aware that since the copy is shallow, changes on object fields (except `data`)
   * reflect on the original scope. Note that changes to the children of data also follow this rule.
   */
  copy(): IScope;
  /** Creates a temporary mlog variable name */
  makeTempName(): string;

  /** Adds the result of an operation to the local cache */
  addCachedOperation(
    op: string,
    result: IValue,
    left: IValue,
    right?: IValue
  ): void;

  /** Attempts to get an operation cached in this or in a parent scope. */
  getCachedOperation(
    op: string,
    left: IValue,
    right?: IValue
  ): IValue | undefined;

  /**
   * Removes all cached operations dependent on the given value.
   *
   * Affects this scope and all of its parents.
   */
  clearDependentCache(value: IValue): void;
}

// we can't use type maps to define actual methods
// and if we don't do this we'll get an error [ts(2425)]
export interface IValueOperators {
  // unary operators
  "!"(scope: IScope, out?: TEOutput): TValueInstructions;
  "u+"(scope: IScope, out?: TEOutput): TValueInstructions;
  "u-"(scope: IScope, out?: TEOutput): TValueInstructions;
  "delete"(scope: IScope, out?: TEOutput): TValueInstructions;
  "typeof"(scope: IScope, out?: TEOutput): TValueInstructions;
  "void"(scope: IScope, out?: TEOutput): TValueInstructions;
  "~"(scope: IScope, out?: TEOutput): TValueInstructions;

  // update operators
  "++"(scope: IScope, prefix: boolean, out?: TEOutput): TValueInstructions;
  "--"(scope: IScope, prefix: boolean, out?: TEOutput): TValueInstructions;

  // left right operators
  "*"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "**"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "+"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "-"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "/"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "%"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "!="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "!=="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "<"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "<="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "=="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "==="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  ">"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  ">="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "&"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "<<"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  ">>"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  ">>>"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "^"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "|"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  instanceof(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  in(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "&&"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "??"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "||"(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "%="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "&="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "*="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "**="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "+="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "-="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "/="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "&&="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "||="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "??="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "<<="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  ">>="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  ">>>="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "^="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "|="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
  "="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions;
}

/** Defines the possible types of mutability of a value */
export enum EMutability {
  /**
   * The value can be changed by the user's code,
   * by the mlog runtime, or us
   */
  mutable,
  /**
   * The value cannot be directly assigned,
   * but it's still not safe from mutations coming from the runtime.
   */
  readonly,
  /** Constant values, won't change during execution */
  constant,
  /** An immutable value that hasn't been initialized yet */
  init,
}

export interface IValue extends IValueOperators {
  // main properties

  /** The name is used by values that exist on some form in the runtime */
  name?: string;
  mutability: EMutability;
  macro: boolean;
  /**
   * Evaluates `this`, returning it's representation in a more basic
   * value like `StoreValue` with the instructions required to compute that value
   */
  eval(scope: IScope, out?: TEOutput): TValueInstructions;
  call(
    scope: IScope,
    args: IValue[],
    out?: TEOutput
  ): TValueInstructions<IValue | null>;
  get(scope: IScope, name: IValue, out?: TEOutput): TValueInstructions;

  /**
   * Wether `this` has a given property.
   * This method is used to know if it's safe to get a
   * field of an object without errors.
   */
  hasProperty(scope: IScope, prop: IValue): boolean;

  /**
   * A hook that the CallExpression and related handlers call
   * before evaluating the function parameters.
   */
  preCall(scope: IScope, out?: TEOutput): readonly TEOutput[] | undefined;

  /**
   * A hook that the CallExpression and related handlers call
   * after the call has been evaluated.
   */
  postCall(scope: IScope): void;

  /** The string representation of `this` in error messages. */
  debugString(): string;

  /**
   * Allows some values to choose alternative representations
   * when they are used as operation outputs.
   */
  toOut(): IValue;
}
/** Helper type that is used in some typescript assertions */
export interface INamedValue extends IValue {
  name: string;
}

export type TLiteral = string | number;
export interface IBindableValue<T extends TLiteral | null = TLiteral>
  extends IValue {
  data: T;
}

export interface IFunctionValue extends IValue {
  return(
    scope: IScope,
    argument: IValue | null,
    out?: TEOutput
  ): TValueInstructions<IValue | null>;
}

/** Contains a value and the instructions required to compute it */
export type TValueInstructions<Content extends IValue | null = IValue> = [
  Content,
  IInstruction[]
];

/** Map of overridable operators in object macros */
export type TOperatorMacroMap = {
  [K in
    | UnaryOperator
    | UpdateOperator
    | LeftRightOperator as `$${K}`]?: MacroFunction;
};
