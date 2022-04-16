import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { LiteralValue, ObjectValue, StoreValue } from "../../values";
import { Building } from "../Building";
import { CompilerError } from "../../CompilerError";
import { createTemp } from "../../utils";

const validModes = [
  "idle",
  "stop",
  "move",
  "approach",
  "boost",
  "pathfind",
  "target",
  "targetp",
  "itemDrop",
  "itemTake",
  "payDrop",
  "payTake",
  "payEnter",
  "mine",
  "flag",
  "build",
  "getBlock",
  "within",
];

export class UnitControl extends MacroFunction<IValue | null> {
  constructor(scope: IScope) {
    super(scope, (mode, ...args) => {
      if (!(mode instanceof LiteralValue) || typeof mode.data !== "string")
        throw new CompilerError(
          "The unitControl mode must be a string literal"
        );

      if (!validModes.includes(mode.data))
        throw new CompilerError("Invalid unitControl mode");

      if (
        args.some(
          value =>
            !(
              value instanceof StoreValue ||
              value instanceof LiteralValue ||
              value instanceof ObjectValue
            )
        )
      )
        throw new CompilerError(
          "The others arguments of unitControl must be literals or stores"
        );

      let result: ObjectValue | StoreValue | null = null;
      let extraArgs: IValue[] = [];
      switch (mode.data) {
        case "getBlock": {
          const outType = createTemp(scope);
          const outBuilding = new Building(scope);

          result = ObjectValue.fromArray(scope, [outType, outBuilding]);
          extraArgs = [outType, outBuilding, new LiteralValue(scope, 0)];
          break;
        }
        case "within": {
          const temp = createTemp(scope);
          result = temp;
          extraArgs = [temp, new LiteralValue(scope, 0)];
          break;
        }
      }

      return [
        result,
        [new InstructionBase("ucontrol", mode.data, ...args, ...extraArgs)],
      ];
    });
  }
}
