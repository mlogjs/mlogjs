import {
  assign,
  extractOutName,
  hideRedundantJumps,
  internalPrefix,
  nodeName,
  pipeInsts,
} from "../utils";
import { Compiler } from "../Compiler";
import { CompilerError } from "../CompilerError";
import {
  AddressResolver,
  EJumpKind,
  JumpInstruction,
  SetCounterInstruction,
} from "../instructions";
import {
  EInstIntent,
  EMutability,
  es,
  IFunctionValue,
  IInstruction,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { LiteralValue } from "./LiteralValue";
import { StoreValue } from "./StoreValue";
import { VoidValue } from "./VoidValue";
import { SenseableValue } from "./SenseableValue";
import { LazyValue } from "./LazyValue";
import { AssignmentValue } from "./AssignmentValue";
import {
  DestructuringValue,
  TDestructuringMembers,
} from "./DestructuringValue";

export type TFunctionValueInitParams = (childScope: IScope) => {
  paramStores: StoreValue[];
  paramNames: string[];
};

type FunctionParam = es.Function["params"][number];
type TParamValue = SenseableValue | AssignmentValue | DestructuringValue;

export class FunctionValue extends VoidValue implements IFunctionValue {
  name: string;
  mutability = EMutability.constant;
  macro = true;

  scope: IScope;
  private childScope!: IScope;
  private params: FunctionParam[];
  private paramValues: TParamValue[] = [];
  private paramNames: Map<TParamValue, string> = new Map();
  private destructuringKeyData: Map<
    IValue,
    { inst: IInstruction[]; value: TParamValue }
  > = new Map();
  private paramOuts: IValue[] = [];
  private minimumArgumentCount = 0;
  private maximumArgumentCount = 0;
  private inst!: IInstruction[];
  private addr!: LiteralValue<number | null>;
  private temp!: SenseableValue;
  private ret!: StoreValue;
  private inline!: boolean;
  private tryingInline!: boolean;
  private body: es.BlockStatement;
  private c: Compiler;
  private callSize!: number;
  private inlineTemp!: IValue;
  private inlineEnd?: LiteralValue<number | null>;
  private bundled = false;
  private initialized = false;

  constructor({
    scope,
    params,
    body,
    c,
    out,
  }: {
    scope: IScope;
    body: es.BlockStatement;
    c: Compiler;
    params: es.Identifier[];
    out?: TEOutput;
  }) {
    super();
    this.scope = scope;
    this.body = body;
    this.c = c;
    this.params = params;
    this.name = extractOutName(out) ?? scope.makeTempName();
  }

  typeof(): TValueInstructions {
    return [new LiteralValue("function"), []];
  }

  private initScope() {
    this.childScope = this.scope.createFunction(this.name);
    this.childScope.function = this;

    for (let i = 0; i < this.params.length; i++) {
      const value = this.unwrapParameter(this.params[i]);
      this.paramValues.push(value);
      this.paramOuts.push(
        value instanceof AssignmentValue ? value.left : value
      );

      if (!(value instanceof AssignmentValue))
        this.minimumArgumentCount = i + 1;
    }
    this.callSize = this.paramValues.length + 2;
    this.maximumArgumentCount = this.params.length;
  }
  private ensureInit() {
    if (this.initialized) return;
    this.initialized = true;

    this.initScope();

    this.addr = new LiteralValue(null);
    this.temp = new SenseableValue(
      `${internalPrefix}f${this.name}`,
      EMutability.mutable
    );
    this.ret = new StoreValue(`${internalPrefix}r${this.name}`);
    this.inst = [
      new AddressResolver(this.addr),
      ...this.c.handle(this.childScope, this.body)[1],
    ];

    if (!endsWithReturn(this, this.inst)) {
      pipeInsts(this.temp["="](this.scope, new LiteralValue(null)), this.inst);
      this.inst.push(
        assign(new SetCounterInstruction(this.ret), {
          intent: EInstIntent.return,
          intentSource: this,
        })
      );
    }
  }

  private normalReturn(
    scope: IScope,
    arg: IValue | null
  ): TValueInstructions<null> {
    const inst: IInstruction[] = [];
    if (arg) {
      const value = pipeInsts(arg.eval(scope, this.temp), inst);
      pipeInsts(this.temp["="](scope, value), inst);
    }
    const returnInst = assign(new SetCounterInstruction(this.ret), {
      intent: EInstIntent.return,
      intentSource: this,
    });
    return [null, [...inst, returnInst]];
  }

  // TODO: use static analysis to determine if
  // we can safely skip the temp value assignment
  private normalCall(
    scope: IScope,
    args: IValue[],
    out?: TEOutput
  ): TValueInstructions {
    if (!this.bundled) this.childScope.inst.push(...this.inst);
    this.bundled = true;
    const callAddressLiteral = new LiteralValue(null);

    // the value will be stored somewhere
    // no need to save it in a temporary variable
    const temp = out
      ? this.temp
      : SenseableValue.from(scope, undefined, EMutability.mutable);

    const inst: IInstruction[] = this.paramValues
      .map(
        (param, i) => param["="](scope, args[i] ?? new LiteralValue(null))[1]
      )
      .reduce((s, c) => s.concat(c), [])
      .concat(
        ...this.ret["="](scope, callAddressLiteral)[1],
        new JumpInstruction(this.addr, EJumpKind.Always),
        new AddressResolver(callAddressLiteral),
        // ensures that functions can be called multiple times inside expressions
        ...temp["="](scope, this.temp)[1]
      );

    return [temp, inst];
  }

  private inlineReturn(
    scope: IScope,
    arg: IValue | null
  ): TValueInstructions<null> {
    if (!this.inlineEnd)
      throw new CompilerError(
        "Error during inline attempt: missing inline end adress"
      );

    const inst: IInstruction[] = [];
    if (arg) {
      const value = pipeInsts(arg.eval(scope, this.inlineTemp), inst);
      pipeInsts(this.inlineTemp["="](scope, value), inst);
    }

    const jump = assign(new JumpInstruction(this.inlineEnd, EJumpKind.Always), {
      intent: EInstIntent.return,
      intentSource: this,
    });

    return [null, [...inst, jump]];
  }

  private inlineCall(
    scope: IScope,
    args: IValue[],
    out?: TEOutput
  ): TValueInstructions {
    // create return value
    this.inlineTemp = SenseableValue.from(
      this.childScope,
      out,
      EMutability.mutable
    );

    // make a copy of the function scope
    const fnScope = this.childScope.copy();

    this.tryingInline = true;
    let inst: IInstruction[] = [];
    // hard set variables within the function scope
    for (let i = 0; i < this.paramValues.length; i++) {
      inst.push(
        ...this.hardSetParameter(fnScope, this.paramValues[i], args[i])
      );
    }

    this.inlineEnd = new LiteralValue(null);

    inst.push(...this.c.handle(fnScope, this.body)[1]);
    this.tryingInline = false;

    const returnIndex = inst.findIndex(
      i =>
        i.alwaysRuns &&
        i.intent === EInstIntent.return &&
        i.intentSource === this
    );
    if (returnIndex !== -1) inst = inst.slice(0, returnIndex + 1);

    inst.push(new AddressResolver(this.inlineEnd));

    // return the function value
    return [this.inlineTemp, inst];
  }

  call(scope: IScope, args: IValue[], out?: TEOutput): TValueInstructions {
    this.ensureInit();
    if (
      args.length < this.minimumArgumentCount ||
      args.length > this.maximumArgumentCount
    ) {
      const min = this.minimumArgumentCount;
      const max = this.maximumArgumentCount;
      if (min !== max)
        throw new CompilerError(
          `Cannot call: expected ${min}-${max} arguments but got: ${args.length}`
        );
      throw new CompilerError(
        `Cannot call: expected ${min} arguments but got: ${args.length}`
      );
    }
    validateParameters(args, this.paramValues);
    const inlineCall = this.inlineCall(scope, args, out);
    hideRedundantJumps(inlineCall[1]);
    const inlineSize = inlineCall[1].filter(i => !i.hidden).length;
    if (this.inline || inlineSize <= this.callSize) return inlineCall;
    return this.normalCall(scope, args, out);
  }

  return(scope: IScope, arg: IValue | null): TValueInstructions<IValue | null> {
    this.ensureInit();
    if (arg && arg.macro) {
      this.inline = true;
      return [null, []];
    }
    if (this.inline || this.tryingInline) return this.inlineReturn(scope, arg);
    return this.normalReturn(scope, arg);
  }

  eval(_scope: IScope): TValueInstructions {
    return [this, []];
  }

  preCall(): readonly IValue[] | undefined {
    this.ensureInit();
    if (this.inline || this.tryingInline) return;
    return this.paramOuts;
  }

  debugString(): string {
    return `FunctionValue("${this.name}")`;
  }

  toString() {
    return '"[macro FunctionValue]"';
  }

  private unwrapParameter(param: FunctionParam): TParamValue {
    switch (param.type) {
      case "Identifier": {
        const name = nodeName(param, !this.c.compactNames && param.name);
        const value = new SenseableValue(name, EMutability.mutable);
        this.childScope.set(param.name, value);
        this.paramNames.set(value, param.name);

        return value;
      }
      case "AssignmentPattern": {
        const left = this.unwrapParameter(param.left as FunctionParam);

        const [rightValue, rightInst] = this.c.handleEval(
          this.childScope,
          param.right,
          left
        );
        const right = new LazyValue(scope => {
          if (this.inline || this.tryingInline) {
            return this.c.handleEval(scope, param.right, left);
          }
          return [rightValue, [...rightInst]];
        });

        return new AssignmentValue(left, right);
      }
      case "ObjectPattern": {
        const members: TDestructuringMembers = new Map();
        for (const prop of param.properties) {
          if (prop.type === "RestElement")
            throw new CompilerError("Rest parameters are not supported");

          const { key: propKey, value: propValue } = prop;
          const propInst: IInstruction[] = [];

          const key =
            propKey.type === "Identifier" && !prop.computed
              ? new LiteralValue(propKey.name)
              : pipeInsts(
                  this.c.handleEval(this.childScope, propKey),
                  propInst
                );

          const value = this.unwrapParameter(propValue as FunctionParam);
          const hasDefault = value instanceof AssignmentValue;
          this.destructuringKeyData.set(key, { inst: propInst, value });

          members.set(key, {
            value: hasDefault ? value.left : value,
            handler: (get, propExists) => {
              return this.c.handle(this.childScope, prop, () => {
                const inst = [...propInst];
                if (propExists() || !hasDefault) {
                  const input = pipeInsts(get(), inst);
                  // assigns the output to the target value
                  const output = pipeInsts(
                    value["="](this.childScope, input),
                    inst
                  );
                  return [output, inst];
                }
                const result = pipeInsts(
                  value["="](this.childScope, new LiteralValue(null)),
                  inst
                );
                return [result, inst];
              });
            },
          });
        }
        return new DestructuringValue(members);
      }
      case "ArrayPattern": {
        const members: TDestructuringMembers = new Map();

        for (let i = 0; i < param.elements.length; i++) {
          const element = param.elements[i];
          if (!element) continue;
          const value = this.unwrapParameter(element as FunctionParam);
          const hasDefault = value instanceof AssignmentValue;

          if (!value)
            throw new CompilerError(
              "Destructuring element must resolve to a value",
              element
            );

          const key = new LiteralValue(i);

          this.destructuringKeyData.set(key, { inst: [], value });
          members.set(key, {
            value: hasDefault ? value.left : value,
            handler: (get, propExists) => {
              return this.c.handle(this.childScope, element, () => {
                if (propExists() || !hasDefault) {
                  const inst = get();
                  // assigns the output to the target value
                  pipeInsts(value["="](this.childScope, inst[0]), inst[1]);
                  return inst;
                }

                return value["="](this.childScope, new LiteralValue(null));
              });
            },
          });
        }
        return new DestructuringValue(members);
      }
      default:
        throw new CompilerError(
          `Unsupported function parameter type: ${param.type}`
        );
    }
  }

  private hardSetParameter(
    scope: IScope,
    param: TParamValue,
    value: IValue = new LiteralValue(null)
  ): IInstruction[] {
    if (param instanceof SenseableValue) {
      const name = this.paramNames.get(param) as string;
      scope.hardSet(name, value);
      return [];
    }

    if (param instanceof AssignmentValue) {
      const [result, inst] = value["??"](scope, param.right, param.left);

      inst.push(
        ...this.hardSetParameter(scope, param.left as TParamValue, result)
      );

      return inst;
    }

    const inst: IInstruction[] = [];
    for (const [key, { value: out }] of param.members) {
      const data = this.destructuringKeyData.get(key);
      if (!data) continue;
      inst.push(...data.inst);
      const hasDefault = data.value instanceof AssignmentValue;
      const input =
        value.hasProperty(scope, key) || !hasDefault
          ? pipeInsts(value.get(scope, key, out), inst)
          : new LiteralValue(null);
      inst.push(...this.hardSetParameter(scope, data.value, input));
    }

    return inst;
  }
}

function endsWithReturn(fun: FunctionValue, inst: IInstruction[]) {
  for (let i = inst.length - 1; i >= 0; i--) {
    const instruction = inst[i];

    // this means that there is an instruction trying to reference
    // the final function `set @counter` instruction
    // of course this generates an unecessary
    // `set @counter` in cases where a control flow
    // structure contains a fallback return statement
    // TODO: fix this with static analysis
    if (instruction instanceof AddressResolver) return false;
    if (instruction.hidden) continue;
    return (
      instruction.intent === EInstIntent.exit ||
      (instruction.intent === EInstIntent.return &&
        instruction.intentSource === fun)
    );
  }
  return false;
}

function validateParameters(args: IValue[], params: IValue[]) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const param = params[i];
    if (
      arg instanceof StoreValue &&
      param instanceof AssignmentValue &&
      param.left.macro
    ) {
      throw new CompilerError(
        "Cannot pass a store to a function parameter that has a macro as a default value."
      );
    }
  }
}
