import { internalPrefix } from "../utils";
import { CompilerError } from "../CompilerError";
import { SetInstruction } from "../instructions";
import { operators } from "../operators";
import { IInstruction, IScope, IValue, TValueInstructions } from "../types";
import { StoreValue } from "./";
import { LiteralValue } from "./LiteralValue";

export interface TempValueOptions {
  scope: IScope;
  name?: string;
  renameable?: boolean;
}

export class TempValue extends StoreValue implements IValue {
  proxied!: IValue;
  canProxy = true;
  setInst!: IInstruction;
  readonly renameable: boolean;

  constructor({ scope, name, renameable }: TempValueOptions) {
    super(
      scope,
      name ??
        `${internalPrefix}t${scope.ntemp}${scope.name ? ":" + scope.name : ""}`
    );
    this.renameable = !!renameable;
    if (!name) scope.ntemp++;
  }

  eval(scope: IScope): TValueInstructions {
    return super.eval(scope);
  }

  "="(scope: IScope, value: IValue): TValueInstructions {
    if (this.proxied) {
      this.noProxy();
      return [this, [new SetInstruction(this, value)]];
    }
    if (value instanceof LiteralValue && this.canProxy) {
      return this.proxy(value);
    }
    return super["="](scope, value);
  }

  proxy(value: IValue): TValueInstructions {
    if (!this.canProxy) {
      console.log(this.proxied);
      throw new CompilerError("Cannot proxy (canProxy = false).");
    }
    if (this.proxied) throw new CompilerError("Cannot proxy multiple times.");
    this.proxied = value;
    this.canProxy = false;
    for (const key of [
      ...operators,
      "eval",
      "get",
      "call",
      "toString",
      "proxy",
      "onScopeSet",
    ] as const) {
      if (key !== "=" && key in value)
        this[key] = (...args: never[]) => {
          // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unsafe-return
          return (value[key as keyof IValue] as Function).apply(value, args);
        };
    }
    this.setInst = new SetInstruction(this, value);
    this.setInst.hidden = true;
    return [this, [this.setInst]];
  }

  noProxy() {
    this.setInst.hidden = false;
    for (const key of [
      ...operators,
      "eval",
      "get",
      "call",
      "toString",
      "proxy",
      "onScopeSet",
    ] as const) {
      this[key] = TempValue.prototype[key] as never;
    }
  }

  onScopeSet(scope: IScope, name: string): void {
    if (this.renameable) this.name = name;
  }
}
