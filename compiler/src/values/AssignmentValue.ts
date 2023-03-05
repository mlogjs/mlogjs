import {
  IInstruction,
  IScope,
  IValue,
  TEOutput,
  TValueInstructions,
} from "../types";
import { pipeInsts } from "../utils";
import { VoidValue } from "./VoidValue";

export class AssignmentValue extends VoidValue {
  constructor(public left: IValue, public right: IValue) {
    super();
    this.name = left.name;
  }

  "="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions {
    const inst: IInstruction[] = [];
    const input = pipeInsts(
      value["??"](scope, this.right, this.left.toOut()),
      inst
    );
    const output = pipeInsts(this.left["="](scope, input, out), inst);

    return [output, inst];
  }

  toOut(): IValue {
    return this.left.toOut();
  }

  debugString(): string {
    return "AssignmentValue";
  }

  toString(): string {
    return '"[macro AssignmentValue]"';
  }
}
