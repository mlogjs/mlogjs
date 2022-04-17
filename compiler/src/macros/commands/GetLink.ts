import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { LiteralValue, StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import { Building } from "../Entities";

export class GetLink extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (index: IValue) => {
      if (
        !(index instanceof StoreValue) &&
        (!(index instanceof LiteralValue) || typeof index.data !== "number")
      )
        throw new CompilerError(
          "The getlink index must be a number literal or a store"
        );
      const outBuild = new Building(scope);
      return [outBuild, [new InstructionBase("getlink", outBuild, index)]];
    });
  }
}
