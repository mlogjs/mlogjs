export * as es from "@babel/types";
import * as es from "@babel/types";
import { Block } from "./flow";
import { ICompilerContext } from "./CompilerContext";
import { HandlerContext } from "./HandlerContext";
import { ImmutableId, ValueId } from "./flow/id";

export enum EInstIntent {
  none,
  break,
  continue,
  return,
  /**
   * This is used by the `end` and `stop` instructions. Means that the processor
   * will restart or shutdown.
   */
  exit,
}

export interface IInstruction {
  intent: EInstIntent;
  /**
   * Used by function values to check if a return instruction originates from
   * them or other function.
   */
  intentSource?: IValue;
  hidden: boolean;
  resolve(i: number): void;
  source?: es.SourceLocation;
  /**
   * Helps analyzing control flow, handlers should indicate which instructions
   * returned are guaranteed to run
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
 * An IValue means that the handler should try to use `this` as the output
 * value.
 */
export type TEOutput = IValue | string;

export type TWriteCallback = (value: ImmutableId, callerNode: es.Node) => void;
export type TDeclareCallback = (
  init: ImmutableId | undefined,
  callerNode: es.Node,
) => void;

export type TDeclarationKind = "var" | "let" | "const";

export type THandler = {
  (
    compilerContext: ICompilerContext,
    scope: IScope,
    handlerContext: HandlerContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arg: any,
  ): ImmutableId;

  handleWrite?: (
    compilerContext: ICompilerContext,
    scope: IScope,
    handlerContext: HandlerContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    arg: any,
  ) => TWriteCallback;

  handleDeclaration?: (
    compilerContext: ICompilerContext,
    scope: IScope,
    handlerContext: HandlerContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node: any,
    kind: TDeclarationKind,
    init?: ImmutableId,
  ) => void;
};
/**
 * The scope manages the source code generated variables and their owners, as
 * well as break and continue statements and they also work as function bodies.
 */
export interface IScope {
  /** Every scope except the top level one has a parent */
  parent: IScope | null;
  /** The registry of variables contained by this scope */
  data: Record<string, ValueId>;
  name: string;
  /**
   * Additional instructions required by this scope, such as the instructions
   * that make the body of a function
   */
  inst: IInstruction[];
  /** The label applied to this scope */
  label?: string;
  /** Where to jump to on a break statement */
  break: Block;
  /** Where to jump to on a continue statement */
  continue: Block;
  /**
   * The function linked to `this`, is `null` when the scope is not inside a
   * function.
   */
  function: IFunctionValue;
  /** Counts the number of temp variables generated during compilaton */
  ntemp: number;

  /**
   * Tells array macros whether to check index access performed. This field is
   * mutable.
   */
  checkIndexes: boolean;

  /**
   * Maps mlogjs' built-in modules, such as `"mlogjs:world"`.
   *
   * This was put here because only the compiler object and scope are accessible
   * to the ast node handlers, and it is more appropriate to put this in the
   * scope rather than the compiler object.
   */
  builtInModules: Record<string, IValue>;

  /** Creates a new scope that has `this` as it's parent. */
  createScope(): IScope;
  /**
   * Creates a new scope to be used by a function value, the scope has the
   * following properties:
   *
   * - Uses `name` as it's primary name, it changes how variable names are
   *   formatted.
   * - It has `this` as it's parent
   * - Independent variable registry
   *
   * @param name The name of the scope
   * @param stacked
   */
  createFunction(name: string, stacked?: boolean): IScope;
  /** Checks if there is an owner registered with the specified identifier */
  has(identifier: string): boolean;
  /** Gets a value by their owner's identifier */
  get(identifier: string): ValueId;
  /**
   * Registers `value` with an owner that uses `name` as both it's name and
   * identifier, throws an error if there already is an owner with the same
   * identitifer.
   *
   * @param name
   * @param value
   */
  set(name: string, id: ValueId): void;
  /**
   * Registers `value` with an owner that uses `name` as both it's name and
   * identifier, overriding any preexisting variables with the same identifier.
   *
   * @param name
   * @param value
   */
  hardSet(name: string, value: ValueId): void;
  /**
   * Creates a shallow copy of this scope.
   *
   * Be aware that since the copy is shallow, changes on object fields (except
   * `data`) reflect on the original scope. Note that changes to the children of
   * data also follow this rule.
   */
  copy(): IScope;
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
  "&&"(
    scope: IScope,
    value: IValue,
    out?: TEOutput,
    endAddress?: TLineRef,
  ): TValueInstructions;
  "??"(
    scope: IScope,
    value: IValue,
    out?: TEOutput,
    endAddress?: TLineRef,
  ): TValueInstructions;
  "||"(
    scope: IScope,
    value: IValue,
    out?: TEOutput,
    endAddress?: TLineRef,
  ): TValueInstructions;
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
  /** The value can be changed by the user's code, by the mlog runtime, or us */
  mutable,
  /**
   * The value cannot be directly assigned, but it's still not safe from
   * mutations coming from the runtime.
   */
  readonly,
  /** Compile-time constants. */
  constant,
  /** An immutable value that hasn't been initialized yet */
  init,
  /** A value unknown at compile-time that will not change after initialization */
  immutable,
}

export interface IValue extends IValueOperators {
  name?: string;
  // main properties
  mutability: EMutability;
  macro: boolean;
  /**
   * Evaluates `this`, returning it's representation in a more basic value like
   * `StoreValue` with the instructions required to compute that value
   */
  eval(scope: IScope, out?: TEOutput): TValueInstructions;
  call(c: ICompilerContext, args: IValue[], out: ImmutableId): IInstruction[];
  get(
    compilerContext: ICompilerContext,
    name: IValue,
    out: ImmutableId,
  ): IInstruction[];

  handleCall(
    c: ICompilerContext,
    context: HandlerContext,
    node: es.Node,
    args: ImmutableId[],
  ): ImmutableId | undefined;

  /**
   * Wether `this` has a given property. This method is used to know if it's
   * safe to get a field of an object without errors.
   */
  hasProperty(compilerContext: ICompilerContext, prop: IValue): boolean;

  /**
   * A hook that the CallExpression and related handlers call before evaluating
   * the function parameters.
   */
  preCall(scope: IScope, out?: TEOutput): readonly TEOutput[] | undefined;

  /**
   * A hook that the CallExpression and related handlers call after the call has
   * been evaluated.
   */
  postCall(scope: IScope): void;

  /** The string representation of `this` in error messages. */
  debugString(): string;

  /** The string representation of `this` in the generated mlog code. */
  toMlogString(): string;

  /**
   * Allows some values to choose alternative representations when they are used
   * as operation outputs.
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
export type TLineRef = IBindableValue<number | null>;

export interface IFunctionValue extends IValue {
  return(
    scope: IScope,
    argument: IValue | null,
    out?: TEOutput,
  ): TValueInstructions<IValue | null>;
}

/** Contains a value and the instructions required to compute it */
export type TValueInstructions<Content extends IValue | null = IValue> = [
  Content,
  IInstruction[],
];

export type TBlockInstructions = [number, Block[]];
