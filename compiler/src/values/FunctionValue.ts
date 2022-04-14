import { internalPrefix, nodeName } from "../utils";
import { Compiler } from "../Compiler";
import { CompilerError } from "../CompilerError";
import {
  AddressResolver,
  EJumpKind,
  JumpInstruction,
  ReturnInstruction,
  SetCounterInstruction,
} from "../instructions";
import {
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

export type TFunctionValueInitParams = (childScope: IScope) => {
  paramStores: StoreValue[];
  paramNames: string[];
};
export class FunctionValue extends VoidValue implements IFunctionValue {
  constant = true;
  macro = true;
  bundled = false;
  inst!: IInstruction[];
  private node: es.Function;
  private childScope!: IScope;
  private params: es.Identifier[];
  private paramOwners: ValueOwner<StoreValue>[] = [];
  private addr!: LiteralValue;
  private temp!: ValueOwner<StoreValue>;
  private ret!: ValueOwner<StoreValue>;
  private inline!: boolean;
  private tryingInline!: boolean;
  private body: es.BlockStatement;
  private c: Compiler;
  private callSize!: number;
  private inlineTemp!: ValueOwner<StoreValue>;
  private inlineEnd!: LiteralValue;
  private initialized = false;

  constructor({
    scope,
    params,
    body,
    c,
    node,
  }: {
    scope: IScope;
    body: es.BlockStatement;
    c: Compiler;
    node: es.Function;
    params: es.Identifier[];
  }) {
    super(scope);
    this.body = body;
    this.c = c;
    this.node = node;
    this.params = params;
  }

  typeof(scope: IScope): TValueInstructions {
    return [new LiteralValue(scope, "function"), []];
  }

  private initScope(name: string) {
    this.childScope = this.scope.createFunction(name);
    this.childScope.function = this;
    for (const id of this.params) {
      const name = this.c.compactNames
        ? nodeName(id)
        : this.childScope.formatName(id.name);
      const owner = new ValueOwner({
        scope: this.childScope,
        value: new StoreValue(this.childScope),
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

    this.scope.functions.push(this);

    const name = this.c.compactNames
      ? nodeName(this.node)
      : this.scope.formatName(this.owner.name);
    this.initScope(name);

    this.addr = new LiteralValue(this.childScope, null as never);
    this.temp = new ValueOwner({
      scope: this.childScope,
      name: `${internalPrefix}f${name}`,
      value: new StoreValue(this.childScope),
    });
    this.ret = new ValueOwner({
      scope: this.childScope,
      name: `${internalPrefix}r${name}`,
      value: new StoreValue(this.childScope),
    });
    this.inst = [
      new AddressResolver(this.addr),
      ...this.c.handle(this.childScope, this.body)[1],
      new SetCounterInstruction(this.ret.value),
    ];
  }

  private normalReturn(
    scope: IScope,
    arg: IValue | null
  ): TValueInstructions<null> {
    const argInst = arg ? this.temp.value["="](scope, arg)[1] : [];
    return [null, [...argInst, new SetCounterInstruction(this.ret.value)]];
  }

  private normalCall(scope: IScope, args: IValue[]): TValueInstructions {
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
    return [null, [...argInst, new ReturnInstruction(this.inlineEnd)]];
  }

  private inlineCall(scope: IScope, args: IValue[]): TValueInstructions {
    // create return value
    this.inlineTemp = new ValueOwner({
      scope: this.childScope,
      value: new StoreValue(scope),
    });
    this.inlineEnd = new LiteralValue(scope, null as never);

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

    this.tryingInline = true;
    const inst = this.c.handle(fnScope, this.body)[1];
    this.tryingInline = false;

    // removing useless instruction
    // get the last instructions
    // const [jump] = inst.slice(-1);
    // if (jump instanceof JumpInstruction) {
    // 	// remove useless jump
    // 	if (jump.args[1] === this.inlineEnd) inst.pop();
    // }

    inst.push(new AddressResolver(this.inlineEnd));

    // return the function value
    return [this.inlineTemp.value, inst];
  }

  call(scope: IScope, args: IValue[]): TValueInstructions {
    this.ensureInit();
    if (args.length !== this.paramOwners.length)
      throw new CompilerError("Cannot call: argument count not matching.");

    if (scope.isRecursion(this)) {
      // TODO: implement recursive call method, possibly rewrite this.inst into stacked version...
      return this.normalCall(scope, args);
    }

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
}
