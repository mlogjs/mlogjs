import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import {
  EMutability,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { LiteralValue } from "./LiteralValue";
import { VoidValue } from "./VoidValue";

export interface IObjectValueData {
  [k: string]: number;
}
export class ObjectValue extends VoidValue {
  mutability = EMutability.constant;
  macro = true;
  data: IObjectValueData;

  constructor(data: IObjectValueData = {}) {
    super();
    this.data = data;
  }

  static fromArray(
    c: ICompilerContext,
    items: IObjectValueData[keyof IObjectValueData][],
    initialData?: IObjectValueData,
  ): ObjectValue {
    const data: IObjectValueData = {
      ...initialData,
      length: c.registerValue(new LiteralValue(items.length)),
    };
    items.forEach((item, i) => {
      if (item) data[i] = item;
    });
    return new ObjectValue(data);
  }

  get(scope: IScope, key: IValue, out?: TEOutput): TValueInstructions {
    if (key instanceof LiteralValue && (key.isNumber() || key.isString())) {
      // avoids naming collisions with keys like
      // constructor or toString
      if (Object.prototype.hasOwnProperty.call(this.data, key.data)) {
        const member = this.data[key.data];
        return member;
      }
    }

    throw new CompilerError(
      `The member [${key.debugString()}] is not present in [${this.debugString()}]`,
    );
  }

  hasProperty(scope: IScope, prop: IValue): boolean {
    if (prop instanceof LiteralValue && (prop.isNumber() || prop.isString())) {
      const hasMember = Object.prototype.hasOwnProperty.call(
        this.data,
        prop.data,
      );
      return hasMember;
    }

    return false;
  }

  eval(): TValueInstructions {
    return [this, []];
  }

  "??"(): TValueInstructions {
    return [this, []];
  }

  debugString(): string {
    if (this.name) return `ObjectValue("${this.name}")`;
    return "ObjectValue";
  }

  toMlogString(): string {
    return '"[macro ObjectValue]"';
  }
}
