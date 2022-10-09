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
  private childScope!: IScope;
  private params: es.Identifier[];
  private paramOwners: ValueOwner<IValue>[] = [];
  private inst!: IInstruction[];
  private addr!: LiteralValue;
  private temp!: ValueOwner<SenseableValue>;
  private ret!: ValueOwner<StoreValue>;
  private inline!: boolean;
  private tryingInline!: boolean;
  private body: es.BlockStatement;
  private c: Compiler;
  private callSize!: number;
  private inlineTemp!: ValueOwner<SenseableValue>;
  private inlineEnd?: LiteralValue;
  private bundled = false;
  private initialized = false;

  constructor({
    scope,
    params,
    body,
    c,
  }: {
    scope: IScope;
    body: es.BlockStatement;
    c: Compiler;
    params: es.Identifier[];
  }) {
    super();
    this.scope = scope;
    this.body = body;
    this.c = c;
    this.params = params;
  }

  typeof(scope: IScope): TValueInstructions {
    return [new LiteralValue(scope, "function"), []];
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

    this.addr = new LiteralValue(this.childScope, null as never);
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
    const argInst = arg ? this.temp.value["="](scope, arg)[1] : [];
    const returnInst = assign(new SetCounterInstruction(this.ret.value), {
      intent: EInstIntent.return,
    });
    return [null, [...argInst, returnInst]];
  }

  private normalCall(scope: IScope, args: IValue[]): TValueInstructions {
    if (!this.bundled) this.childScope.inst.push(...this.inst);
    this.bundled = true;
    const callAddressLiteral = new LiteralValue(scope, null as never);
    const inst: IInstruction[] = this.paramOwners
      .map(({ value: param }, i) => param["="](scope, args[i])[1])
      .reduce((s, c) => s.concat(c), [])
      .concat(
        ...this.ret.value["="](scope, callAddressLiteral)[1],
        new JumpInstruction(this.addr, EJumpKind.Always),
        new AddressResolver(callAddressLiteral)
      );
    return [this.temp.value, inst];
  }

  private inlineReturn(
    scope: IScope,
    arg: IValue | null
  ): TValueInstructions<null> {
    const argInst = arg ? this.inlineTemp.value["="](scope, arg)[1] : [];

    if (!this.inlineEnd)
      throw new CompilerError(
        "Error during inline attempt: missing inline end adress"
      );

    const jump = assign(new JumpInstruction(this.inlineEnd, EJumpKind.Always), {
      intent: EInstIntent.return,
    });

    return [null, [...argInst, jump]];
  }

  private inlineCall(scope: IScope, args: IValue[]): TValueInstructions {
    // create return value
    this.inlineTemp = new ValueOwner({
      scope: this.childScope,
      value: assign(new SenseableValue(scope), {
        mutability: EMutability.mutable,
      }),
    });

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

    this.inlineEnd = new LiteralValue(scope, null as never);

    this.tryingInline = true;
    let inst = this.c.handle(fnScope, this.body)[1];
    this.tryingInline = false;

    const returnIndex = inst.findIndex(
      i => i.alwaysRuns && i.intent === EInstIntent.return
    );
    if (returnIndex !== -1) inst = inst.slice(0, returnIndex + 1);

    inst.push(new AddressResolver(this.inlineEnd));

    // return the function value
    return [this.inlineTemp.value, inst];
  }

  call(scope: IScope, args: IValue[]): TValueInstructions {
    this.ensureInit();
    if (args.length !== this.paramOwners.length)
      throw new CompilerError("Cannot call: argument count not matching.");
    const inlineCall = this.inlineCall(scope, args);
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
    if (instruction.hidden) continue;
    return instruction instanceof SetCounterInstruction;
  }
  return false;
}
