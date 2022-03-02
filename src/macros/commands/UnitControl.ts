import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { LiteralValue, ObjectValue, StoreValue, TempValue } from "../../values";
import { Building } from "../Building";

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

export class UnitControl extends MacroFunction {
  constructor(scope: IScope) {
    super(scope, (mode, ...args) => {
      if (!(mode instanceof LiteralValue) || typeof mode.data !== "string")
        throw new Error("The unitControl mode must be a string literal");

      if (!validModes.includes(mode.data))
        throw new Error("Invalid unitControl mode");

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
        throw new Error(
          "The others arguments of unitControl must be literals or stores"
        );

      let result: ObjectValue | TempValue | null = null;
      let extraArgs = [];
      switch (mode.data) {
        case "getBlock": {
          const outType = new TempValue(scope);
          const outBuilding = new TempValue(scope);
          result = new ObjectValue(scope, {
            0: outType,
            1: new Building(scope, outBuilding.name),
            length: new LiteralValue(scope, 2),
          });
          extraArgs = [outType, outBuilding, new LiteralValue(scope, 0)];
          break;
        }
        case "within": {
          const temp = new TempValue(scope);
          result = temp;
          extraArgs = [temp, 0];
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
