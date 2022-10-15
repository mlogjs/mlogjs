import { IBindableValue, IInstruction } from "../types";
import { IBreakable, IConstruct, IContinuable } from "./types";

export interface ILoopConstructOptions {
  continueLine: IBindableValue;
  breakLine: IBindableValue;
  body: IConstruct[];
  /** The condition to check before looping back */
  condition: IConstruct[];
}

export class LoopConstruct
  implements IConstruct, IBreakable, IContinuable, ILoopConstructOptions
{
  continueLine: IBindableValue;
  breakLine: IBindableValue;
  body: IConstruct[];
  condition: IConstruct[];

  constructor({
    body,
    breakLine,
    condition,
    continueLine,
  }: ILoopConstructOptions) {
    this.body = body;
    this.breakLine = breakLine;
    this.condition = condition;
    this.continueLine = continueLine;
  }

  addContinue(): void {
    throw new Error("Method not implemented.");
  }
  addBreak(): void {
    throw new Error("Method not implemented.");
  }
  expand(): IInstruction[] {
    throw new Error("Method not implemented.");
  }
}
