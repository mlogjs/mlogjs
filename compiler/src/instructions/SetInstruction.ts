import { InstructionBase } from ".";
import { IValue } from "../types";
import { discardedName } from "../utils";
import { StoreValue } from "../values";

export class SetInstruction extends InstructionBase {
  constructor(store: IValue, value: IValue) {
    super("set", store, value);
  }

  get store() {
    return this.args[1] as IValue;
  }

  get value() {
    return this.args[2] as IValue;
  }

  get hidden(): boolean {
    const { store, value } = this;
    return (
      this._hidden ||
      // assignment to discarded value
      store.name === discardedName ||
      // self assignment of a store
      (!!store.name &&
        store instanceof StoreValue &&
        value instanceof StoreValue &&
        store.name === value.name)
    );
  }
}
