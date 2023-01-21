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

export type TFunctionValueInitParams = (childScope: IScope) => {
  paramStores: StoreValue[];
  paramNames: string[];
};
export class FunctionValue extends VoidValue implements IFunctionValue {
  name: string;
  mutability = EMutability.constant;
  macro = true;

  scope: IScope;
  private out?: TEOutput;
  private childScope!: IScope;
  private params: es.Identifier[];
  private paramValues: IValue[] = [];
  private paramNames: string[] = [];
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
    this.out = out;
    this.name = extractOutName(out) ?? scope.makeTempName();
  }

  typeof(): TValueInstructions {
    return [new LiteralValue("function"), []];
  }

  private initScope() {
    this.childScope = this.scope.createFunction(this.name);
    this.childScope.function = this;
    for (const id of this.params) {
      const name = nodeName(id, !this.c.compactNames && id.name);
      const value = new SenseableValue(name, EMutability.mutable);
      this.childScope.set(id.name, value);
      this.paramValues.push(value);
      this.paramNames.push(id.name);
    }
    this.callSize = this.paramValues.length + 2;
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
      .map((param, i) => param["="](scope, args[i])[1])
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
    // hard set variables within the function scope
    this.paramNames.forEach((name, i) => {
      fnScope.hardSet(name, args[i]);
    });

    this.inlineEnd = new LiteralValue(null);

    this.tryingInline = true;
    let inst = this.c.handle(fnScope, this.body)[1];
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
    if (args.length !== this.paramNames.length)
      throw new CompilerError(
        `Cannot call: expected ${this.paramNames.length} arguments but got: ${args.length}`
      );
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
    return this.paramValues;
  }

  debugString(): string {
    return `FunctionValue("${this.name}")`;
  }

  toString() {
    return '"[macro FunctionValue]"';
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
