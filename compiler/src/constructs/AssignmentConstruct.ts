import { IInstruction, TValueId } from "../types";
import { IConstruct } from "./types";

export class AssignmentConstruct implements IConstruct {
  constructor(public left: TValueId, public right: TValueId) {}

  expand(): IInstruction[] {
    throw new Error("Method not implemented.");
  }
}
