import { InstructionBase } from "../../instructions";
import { IScope, IValue } from "../../types";
import {
  LiteralValue,
  ObjectValue,
  SenseableValue,
  StoreValue,
} from "../../values";
import { createOverloadNamespace } from "../util";

export class UnitControl extends ObjectValue {
  constructor(scope: IScope) {
    const data = createOverloadNamespace({
      overloads: {
        idle: { args: [] },
        stop: { args: [] },
        move: { args: ["x", "y"] },
        approach: { named: "options", args: ["x", "y", "radius"] },
        boost: { args: ["enable"] },
        pathfind: { args: [] },
        target: { named: "options", args: ["x", "y", "shoot"] },
        targetp: { named: "options", args: ["unit", "shoot"] },
        itemDrop: { args: ["target", "amount"] },
        itemTake: { args: ["target", "item", "amount"] },
        payDrop: { args: [] },
        payTake: { named: "options", args: ["takeUnits"] },
        payEnter: { args: [] },
        mine: { args: ["x", "y"] },
        flag: { args: ["value"] },
        build: {
          named: "options",
          args: ["x", "y", "block", "rotation", { key: "config", default: "" }],
        },
        getBlock: {
          args: ["x", "y"],
        },
        within: {
          named: "options",
          args: ["x", "y", "radius"],
        },
      },
      handler(scope, overload, ...args) {
        let result: ObjectValue | StoreValue | null = null;
        let extraArgs: IValue[] = [];
        switch (overload) {
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
          [new InstructionBase("ucontrol", overload, ...args, ...extraArgs)],
        ];
      },
    });
    super(scope, data);
  }
}
