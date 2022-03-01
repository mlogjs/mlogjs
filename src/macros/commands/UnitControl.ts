import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import { LiteralValue, StoreValue } from "../../values";

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
            !(value instanceof StoreValue || value instanceof LiteralValue)
        )
      )
        throw new Error(
          "The others arguments of unitControl must be literals or stores"
        );

      return [null, [new InstructionBase("ucontrol", mode.data, ...args)]];
    });
  }
}
