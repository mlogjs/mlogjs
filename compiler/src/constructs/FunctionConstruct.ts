import { IInstruction } from "../types";
import { CallConstruct } from "./CallConstruct";
import { IConstruct } from "./types";

export class FunctionConstruct implements IConstruct {
  callers: CallConstruct[] = [];

  expand(): IInstruction[] {
    throw new Error("Method not implemented.");
  }
}
