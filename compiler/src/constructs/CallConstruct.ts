import { IInstruction, TValueId } from "../types";
import { IConstruct } from "./types";

export class CallConstruct implements IConstruct {
  constructor(public callee: TValueId, public args: IConstruct[][]) {}

  expand(): IInstruction[] {
    throw new Error("Method not implemented.");
  }
}
