import { assign, internalPrefix, nodeName } from "../utils";
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
import { ValueOwner } from "./ValueOwner";
import { SenseableValue } from "./SenseableValue";

export type TFunctionValueInitParams = (childScope: IScope) => {
  paramStores: StoreValue[];
  paramNames: string[];
};
export class FunctionValue extends VoidValue implements IFunctionValue {
  mutability = EMutability.constant;
  macro = true;

  scope: IScope;
  private out?: TEOutput;
  private childScope!: IScope;
  private params: es.Identifier[];
  private paramOwners: ValueOwner<IValue>[] = [];
  private inst!: IInstruction[];
  private addr!: LiteralValue<number | null>;
  private temp!: ValueOwner<SenseableValue>;
  private ret!: ValueOwner<StoreValue>;
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
  }

  typeof(): TValueInstructions {
    return [new LiteralValue("function"), []];
  }

  private initScope(name: string) {
    this.childScope = this.scope.createFunction(name);
    this.childScope.function = this;
    for (const id of this.params) {
      const name = nodeName(id, !this.c.compactNames && id.name);
      const owner = new ValueOwner({
        scope: this.childScope,
        value: assign(new SenseableValue(this.childScope), {
          mutability: EMutability.mutable,
        }),
        identifier: id.name,
        name,
      });
      this.childScope.set(owner);
      this.paramOwners.push(owner);
    }
    this.callSize = this.paramOwners.length + 2;
  }
  private ensureInit() {
    if (!this.owner)
      throw new CompilerError(`Functions must be owned by a variable`);

    if (this.initialized) return;
    this.initialized = true;

    const { name } = this.owner;
    this.initScope(name);

    this.addr = new LiteralValue(null);
    this.temp = new ValueOwner({
      scope: this.childScope,
      name: `${internalPrefix}f${name}`,
      value: assign(new SenseableValue(this.childScope), {
        mutability: EMutability.mutable,
      }),
    });
    this.ret = new ValueOwner({
      scope: this.childScope,
      name: `${internalPrefix}r${name}`,
      value: new StoreValue(this.childScope),
    });
    this.inst = [
      new AddressResolver(this.addr),
      ...this.c.handle(this.childScope, this.body)[1],
    ];

    if (!endsWithReturn(this.inst)) {
      this.inst.push(
        assign(new SetCounterInstruction(this.ret.value), {
          intent: EInstIntent.return,
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
      const [value, valueInst] = arg.eval(scope, this.temp.value);
      const argInst = this.temp.value["="](scope, value)[1];
      inst.push(...valueInst);
      inst.push(...argInst);
    }
    const returnInst = assign(new SetCounterInstruction(this.ret.value), {
      intent: EInstIntent.return,
    });
    return [null, [...inst, returnInst]];
  }

  // TODO: use static analysis to determine if
  // we can safely skip the temp value assignment
  private normalCall(scope: IScope, args: IValue[]): TValueInstructions {
    if (!this.bundled) this.childScope.inst.push(...this.inst);
    this.bundled = true;
    const callAddressLiteral = new LiteralValue(null);
    const temp = assign(new SenseableValue(scope), {
      mutability: EMutability.mutable,
    });
    const inst: IInstruction[] = this.paramOwners
      .map(({ value: param }, i) => param["="](scope, args[i])[1])
      .reduce((s, c) => s.concat(c), [])
      .concat(
        ...this.ret.value["="](scope, callAddressLiteral)[1],
        new JumpInstruction(this.addr, EJumpKind.Always),
        new AddressResolver(callAddressLiteral),
        // ensures that functions can be called multiple times inside expressions
        ...temp["="](scope, this.temp.value)[1]
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
      const [value, valueInst] = arg.eval(scope, this.inlineTemp);
      const argInst = this.inlineTemp["="](scope, value)[1];
      inst.push(...valueInst);
      inst.push(...argInst);
    }

    const jump = assign(new JumpInstruction(this.inlineEnd, EJumpKind.Always), {
      intent: EInstIntent.return,
    });

    return [null, [...inst, jump]];
  }

  private inlineCall(
    scope: IScope,
    args: IValue[],
    out?: TEOutput
  ): TValueInstructions {
    // create return value
    this.inlineTemp = out
      ? SenseableValue.out(scope, out, EMutability.mutable)
      : SenseableValue.named(this.childScope, undefined, EMutability.mutable);

    // make a copy of the function scope
    const fnScope = this.childScope.copy();
    // hard set variables within the function scope
    this.paramOwners.forEach((owner, i) => {
      const value = args[i];
      if (!value.owner?.persistent) owner.own(value);
      fnScope.hardSet(
        new ValueOwner({
          scope: fnScope,
          value,
          identifier: owner.identifier,
          name: owner.name,
        })
      );
    });

    this.inlineEnd = new LiteralValue(null);

    this.tryingInline = true;
    let inst = this.c.handle(fnScope, this.body)[1];
    this.tryingInline = false;

    const returnIndex = inst.findIndex(
      i => i.alwaysRuns && i.intent === EInstIntent.return
    );
    if (returnIndex !== -1) inst = inst.slice(0, returnIndex + 1);

    inst.push(new AddressResolver(this.inlineEnd));

    // return the function value
    return [this.inlineTemp, inst];
  }

  call(scope: IScope, args: IValue[], out?: TEOutput): TValueInstructions {
    this.ensureInit();
    if (args.length !== this.paramOwners.length)
      throw new CompilerError("Cannot call: argument count not matching.");
    const inlineCall = this.inlineCall(scope, args, out);
    const inlineSize = inlineCall[1].filter(i => !i.hidden).length;
    if (this.inline || inlineSize <= this.callSize) return inlineCall;
    return this.normalCall(scope, args);
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

  consume(_scope: IScope): TValueInstructions {
    return [this, []];
  }
}

function endsWithReturn(inst: IInstruction[]) {
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
    return instruction instanceof SetCounterInstruction;
  }
  return false;
}
