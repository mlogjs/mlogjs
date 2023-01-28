import { InstructionBase } from "../../instructions";
import { IValue } from "../../types";
import { extractDestrucuringOut } from "../../utils";
import {
  LiteralValue,
  ObjectValue,
  SenseableValue,
  StoreValue,
} from "../../values";
import { createOverloadNamespace } from "../util";

export class UnitControl extends ObjectValue {
  constructor() {
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
        unbind: {
          args: [],
        },
      },
      handler(scope, overload, out, ...args) {
        let result: IValue | null = null;
        let extraArgs: IValue[] = [];
        switch (overload) {
          case "getBlock": {
            const outType = StoreValue.from(
              scope,
              extractDestrucuringOut(out, 0)
            );
            const outBuilding = SenseableValue.from(
              scope,
              extractDestrucuringOut(out, 1)
            );
            const outFloor = StoreValue.from(
              scope,
              extractDestrucuringOut(out, 2)
            );

            result = ObjectValue.fromArray([outType, outBuilding, outFloor]);
            extraArgs = [outType, outBuilding, outFloor];
            break;
          }
          case "within": {
            result = StoreValue.from(scope, out);
            extraArgs = [result, new LiteralValue(0)];
            break;
          }
        }
        return [
          result,
          [new InstructionBase("ucontrol", overload, ...args, ...extraArgs)],
        ];
      },
    });
    super(data);
  }
}
