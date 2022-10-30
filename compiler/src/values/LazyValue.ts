import { IValue } from "../types";
import { VoidValue } from "./VoidValue";

/**
 * This class is used to handle some cases where the value
 * can't be directly evaluated by the node handler
 */
export class LazyValue extends VoidValue {
  constructor(options: Pick<IValue, "eval" | "consume">) {
    super();
    this.eval = options.eval;
    this.consume = options.consume;
  }
}
