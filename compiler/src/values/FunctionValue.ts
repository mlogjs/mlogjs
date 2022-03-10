import { Compiler } from "../Compiler";
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
import { TempValue } from "./TempValue";
import { VoidValue } from "./VoidValue";

export class FunctionValue extends VoidValue implements IFunctionValue {
  constant = true;
  macro = true;
  private paramStores: StoreValue[];
  private paramNames: string[];
  private inst!: IInstruction[];
  private addr!: LiteralValue;
  private temp!: StoreValue;
  private ret!: StoreValue;
  private inline!: boolean;
  private tryingInline!: boolean;
  private body: es.BlockStatement;
  private name: string;
  private c: Compiler;
  private callSize: number;
  private inlineTemp!: TempValue;
  private inlineEnd!: LiteralValue;
  private bundled: boolean = false;

  private createValues() {
    this.addr = new LiteralValue(this.scope, null as never);
    this.temp = new StoreValue(this.scope, "f" + this.name);
    this.ret = new StoreValue(this.scope, "r" + this.name);
  }

  typeof(scope: IScope): TValueInstructions {
    return [new LiteralValue(scope, "function"), []];
  }

  private createInst() {
    this.inst = [
      new AddressResolver(this.addr),
      ...this.c.handle(this.scope, this.body)[1],
    ];
    this.inst.push(new SetCounterInstruction(this.ret));
  }

  constructor(
    scope: IScope,
    name: string,
    paramNames: string[],
    paramStores: StoreValue[],
    body: es.BlockStatement,
    c: Compiler
  ) {
    super(scope);

    this.name = name;
    this.paramNames = paramNames;
    this.paramStores = paramStores;
    this.body = body;
    this.c = c;

    this.callSize = paramStores.length + 2;
    scope.function = this;

    this.createValues();
    this.createInst();
  }

  private normalReturn(scope: IScope, arg: IValue): TValueInstructions<null> {
    const argInst = arg ? this.temp["="](scope, arg)[1] : [];
    return [null, [...argInst, new SetCounterInstruction(this.ret)]];
  }

  private normalCall(scope: IScope, args: IValue[]): TValueInstructions {
    if (!this.bundled) this.scope.inst.push(...this.inst);
    this.bundled = true;
    const callAddressLiteral = new LiteralValue(scope, null as never);
    const inst: IInstruction[] = this.paramStores
      .map((param, i) => param["="](scope, args[i])[1])
      .reduce((s, c) => s.concat(c), [])
      .concat(
        ...this.ret["="](scope, callAddressLiteral)[1],
        new JumpInstruction(this.addr, EJumpKind.Always),
        new AddressResolver(callAddressLiteral)
      );
    return [this.temp, inst];
  }

  private inlineReturn(scope: IScope, arg: IValue): TValueInstructions<null> {
    const argInst = arg ? this.inlineTemp["="](scope, arg)[1] : [];
    return [null, [...argInst, new ReturnInstruction(this.inlineEnd)]];
  }

  private inlineCall(scope: IScope, args: IValue[]): TValueInstructions {
    // create return value
    this.inlineTemp = new TempValue(scope);
    this.inlineEnd = new LiteralValue(scope, null as never);

    // make a copy of the function scope
    const fnScope = this.scope.copy();
    // hard set variables within the function scope
    this.paramNames.forEach((name, i) => fnScope.hardSet(name, args[i]));

    this.tryingInline = true;
    let inst = this.c.handle(fnScope, this.body)[1];
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
    if (args.length !== this.paramStores.length)
      throw new Error("Cannot call: argument count not matching.");
    const inlineCall = this.inlineCall(scope, args);
    const inlineSize = inlineCall[1].filter(i => !i.hidden).length;
    if (this.inline || inlineSize <= this.callSize) return inlineCall;
    return this.normalCall(scope, args);
  }

  return(scope: IScope, arg: IValue): TValueInstructions<IValue | null> {
    if (arg && arg.macro) {
      this.inline = true;
      return [null, []];
    }
    if (this.inline || this.tryingInline) return this.inlineReturn(scope, arg);
    return this.normalReturn(scope, arg);
  }

  eval(scope: IScope): TValueInstructions {
    return [this, []];
  }
}
