import { IBindableValue, IInstruction } from "../types";
import { IConstruct } from "./types";

export type TFlowIntent = "break" | "continue";

export interface IFlowConstructOptions {
  intent: TFlowIntent;
  target: IBindableValue;
}
export class FlowConstruct implements IConstruct {
  intent: TFlowIntent;
  target: IBindableValue;

  constructor({ intent, target }: IFlowConstructOptions) {
    this.intent = intent;
    this.target = target;
  }

  expand(): IInstruction[] {
    throw new Error("Method not implemented.");
  }
}
