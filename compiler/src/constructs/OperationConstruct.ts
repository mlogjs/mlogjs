import { BinaryOperator } from "../operators";
import { IInstruction, TValueId } from "../types";
import { IConstruct } from "./types";

export interface IOperationConstructOptions {
  left: IConstruct[];
  right: IConstruct[];
  operator: BinaryOperator;
  result: TValueId;
}

export class OperationConstruct implements IConstruct {
  result: TValueId;
  left: IConstruct[];
  right: IConstruct[];
  operator: BinaryOperator;

  constructor({ left, right, operator, result }: IOperationConstructOptions) {
    this.left = left;
    this.right = right;
    this.operator = operator;
    this.result = result;
  }

  expand(): IInstruction[] {
    throw new Error("Method not implemented.");
  }
}
