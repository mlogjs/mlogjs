import { IBindableValue, IInstruction, IValue } from "../types";

export interface IConstruct {
  expand(): IInstruction[];
  readValue?(): IValue;
}

export interface IBreakable {
  addBreak(): void;
  readonly breakLine: IBindableValue;
}

export interface IContinuable {
  addContinue(): void;
  readonly continueLine: IBindableValue;
}
