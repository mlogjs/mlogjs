import { IInstruction, TValueId } from "../types";
import { IConstruct } from "./types";

export interface IConditionTest {
  /**
   * The lines evaluated to compute the test of this condition.
   * As with most cases, the value of the last instruction is used.
   */
  evaluated: IConstruct[];
  /** The code that will be executed if the test evaluates to `true` */
  branch: IConstruct[];
}

export interface IConditionalConstructOptions {
  conditions: IConditionTest[];
  alternate?: IConstruct[];
  value?: TValueId;
}

export class ConditionConstruct implements IConstruct {
  // used for conditional expressions
  value?: TValueId;
  conditions: IConditionTest[];
  alternate: IConstruct[];

  constructor({
    conditions,
    value,
    alternate = [],
  }: IConditionalConstructOptions) {
    this.alternate = alternate;
    this.conditions = conditions;
    this.value = value;
  }

  expand(): IInstruction[] {
    throw new Error("Method not implemented.");
  }
}
