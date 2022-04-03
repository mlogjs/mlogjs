import { internalPrefix } from "../utils";
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

export class FunctionValue extends VoidValue implements IFunctionValue {
  constant = true;
  macro = true;
  private paramStores: StoreValue[];
  private paramNames: string[];
  private inst!: IInstruction[];
  private addr!: LiteralValue;
  private temp!: ValueOwner<StoreValue>;
  private ret!: ValueOwner<StoreValue>;
  private inline!: boolean;
  private tryingInline!: boolean;
  private body: es.BlockStatement;
  private name: string;
  private c: Compiler;
  private callSize: number;
  private inlineTemp!: StoreValue;
  private inlineEnd!: LiteralValue;
  private bundled = false;
  private initialized = false;

  typeof(scope: IScope): TValueInstructions {
    return [new LiteralValue(scope, "function"), []];
  }

  private ensureInit() {
    if (this.initialized) return;
    this.initialized = true;
    this.addr = new LiteralValue(this.scope, null as never);
    this.temp = new ValueOwner({
      scope: this.scope,
      name: `${internalPrefix}f${this.name}`,
      value: new StoreValue(this.scope),
    });
    this.ret = new ValueOwner({
      scope: this.scope,
      name: `${internalPrefix}r${this.name}`,
      value: new StoreValue(this.scope),
    });
    this.inst = [
      new AddressResolver(this.addr),
      ...this.c.handle(this.scope, this.body)[1],
    ];
    this.inst.push(new SetCounterInstruction(this.ret.value));
  }

  constructor({
    scope,
    name,
    paramNames,
    paramStores,
    body,
    c,
  }: {
    scope: IScope;
    name: string;
    paramNames: string[];
    paramStores: StoreValue[];
    body: es.BlockStatement;
    c: Compiler;
    renameable?: boolean;
  }) {
    super(scope);

    this.name = name;
    this.paramNames = paramNames;
    this.paramStores = paramStores;
    this.body = body;
    this.c = c;

    this.callSize = paramStores.length + 2;
    scope.function = this;
  }

  private normalReturn(
    scope: IScope,
    arg: IValue | null
  ): TValueInstructions<null> {
    const argInst = arg ? this.temp.value["="](scope, arg)[1] : [];
    return [null, [...argInst, new SetCounterInstruction(this.ret.value)]];
  }

  private normalCall(scope: IScope, args: IValue[]): TValueInstructions {
    if (!this.bundled) this.scope.inst.push(...this.inst);
    this.bundled = true;
    const callAddressLiteral = new LiteralValue(scope, null as never);
    const inst: IInstruction[] = this.paramStores
      .map((param, i) => param["="](scope, args[i])[1])
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
    const argInst = arg ? this.inlineTemp["="](scope, arg)[1] : [];
    return [null, [...argInst, new ReturnInstruction(this.inlineEnd)]];
  }

  private inlineCall(scope: IScope, args: IValue[]): TValueInstructions {
    // create return value
    this.inlineTemp = new StoreValue(scope);
    this.inlineEnd = new LiteralValue(scope, null as never);

    // make a copy of the function scope
    const fnScope = this.scope.copy();
    // hard set variables within the function scope
    this.paramNames.forEach((name, i) => fnScope.hardSet(name, args[i]));

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
    return [this.inlineTemp, inst];
  }

  call(scope: IScope, args: IValue[]): TValueInstructions {
    this.ensureInit();
    if (args.length !== this.paramStores.length)
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
}
