import { IInstruction } from "../types";
import { IConstruct } from "./types";

export interface IReturnConstructOptions {}
export class ReturnConstruct implements IConstruct {
  expand(): IInstruction[] {
    throw new Error("Method not implemented.");
  }
}
