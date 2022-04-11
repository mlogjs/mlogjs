import { CompilerError } from "../CompilerError";
import { MacroFunction } from "../macros";
import { operators } from "../operators";
import {
  IScope,
  IValue,
  TOperatorMacroMap,
  TValueInstructions,
} from "../types";
import { LiteralValue } from "./LiteralValue";
import { ValueOwner } from "./ValueOwner";
import { VoidValue } from "./VoidValue";

export interface IObjectValueData extends TOperatorMacroMap {
  [k: string]: IValue | undefined;
  $get?: MacroFunction<IValue>;
  $eval?: MacroFunction<IValue>;
  $consume?: MacroFunction<IValue>;
}
export class ObjectValue extends VoidValue {
  constant = true;
  macro = true;
  data: IObjectValueData;

  constructor(scope: IScope, data: IObjectValueData = {}) {
    super(scope);
    this.data = data;
  }

  typeof(scope: IScope): TValueInstructions {
    return [new LiteralValue(scope, "object"), []];
  }

  get(scope: IScope, key: LiteralValue): TValueInstructions {
    // avoids naming collisions with keys like
    // constructor or toString
    if (Object.prototype.hasOwnProperty.call(this.data, key.data)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const member = this.data[key.data]!;
      return [member, []];
    }
    const { $get } = this.data;
    if (!$get) throw new CompilerError("Cannot get undefined member.");
    return $get.call(scope, [key]);
  }

  eval(scope: IScope): TValueInstructions {
    const { $eval } = this.data;
    if (!$eval) return [this, []];
    return $eval.call(scope, []);
  }
  consume(scope: IScope): TValueInstructions {
    const { $consume } = this.data;
    if ($consume) return $consume.call(scope, []);
    const [res, resInst] = this.eval(scope);
    res.ensureOwned();
    return [res, resInst];
  }
  call(scope: IScope, args: IValue[]): TValueInstructions<IValue | null> {
    const { $call } = this.data;
    if (!$call) return super.call(scope, args);
    return $call.call(scope, args);
  }

  ensureOwned(): void {
    this.owner ??= new ValueOwner({ scope: this.scope, value: this });
  }
}

for (const op of operators) {
  ObjectValue.prototype[op] = function (
    this: ObjectValue,
    ...args: [IScope, ...never[]]
  ) {
    const $ = this.data[`$${op}`];
    // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-unsafe-return
    if (!$) return (VoidValue.prototype[op] as Function).apply(this, args);
    const [scope, ...fnArgs] = args;
    return $.call(scope, fnArgs);
  };
}
