import { IValue } from "../types";
import { VoidValue } from "./VoidValue";

/**
 * This class is used to handle some cases where the value
 * can't be directly evaluated by the node handler
 */
export class LazyValue extends VoidValue {
  constructor(evalutate: IValue["eval"]) {
    super();
    this.eval = evalutate;
  }

  debugString(): string {
    return "LazyValue";
  }

  toString(): string {
    return '"[macro LazyValue]"';
  }
}
