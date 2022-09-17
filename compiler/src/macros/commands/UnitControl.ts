import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope, IValue } from "../../types";
import {
  LiteralValue,
  ObjectValue,
  SenseableValue,
  StoreValue,
} from "../../values";
import { CompilerError } from "../../CompilerError";
import { assertLiteralOneOf } from "../../assertions/literals";

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
] as const;

export class UnitControl extends MacroFunction<IValue | null> {
  constructor(scope: IScope) {
    super(scope, (mode, ...args) => {
      assertLiteralOneOf(mode, validModes, "The unitControl mode");

      if (
        args.some(
          value =>
            !(value instanceof StoreValue || value instanceof LiteralValue)
        )
      )
        throw new CompilerError(
          "The others arguments of unitControl must be literals or stores"
        );

      let result: ObjectValue | StoreValue | null = null;
      let extraArgs: IValue[] = [];
      switch (mode.data) {
        case "getBlock": {
          const outType = new StoreValue(scope);
          const outBuilding = new SenseableValue(scope);

          result = ObjectValue.fromArray(scope, [outType, outBuilding]);
          extraArgs = [outType, outBuilding, new LiteralValue(scope, 0)];
          break;
        }
        case "within": {
          const temp = new StoreValue(scope);
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
