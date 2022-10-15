import { IInstruction, TValueId } from "../types";
import { IConstruct } from "./types";

export class ValueConstruct implements IConstruct {
  constructor(public value: TValueId) {}
  expand(): IInstruction[] {
    throw new Error("Method not implemented.");
  }
}
