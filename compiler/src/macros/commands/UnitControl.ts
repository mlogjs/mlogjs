import { ICompilerContext } from "../../CompilerContext";
import { ImmutableId, NativeInstruction } from "../../flow";
import { ObjectValue } from "../../values";
import { createOverloadNamespace, filterIds } from "../util";

export class UnitControl extends ObjectValue {
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
      overloads: {
        idle: { args: [] },
        stop: { args: [] },
        move: { args: ["x", "y"] },
        approach: { named: "options", args: ["x", "y", "radius"] },
        pathfind: { args: ["x", "y"] },
        autoPathfind: { args: [] },
        boost: { args: ["enable"] },
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
      handler(c, overload, cursor, loc, ...args) {
        // let result: IValue | null = null;
        // let extraArgs: IValue[] = [];
        let result = c.nullId;
        let extraArgs: (string | ImmutableId)[] = [];
        let outputs: ImmutableId[] = [];

        switch (overload) {
          case "getBlock": {
            const outType = c.createImmutableId();
            const outBuilding = c.createImmutableId();
            const outFloor = c.createImmutableId();

            result = c.registerValue(
              ObjectValue.fromArray(c, [outType, outBuilding, outFloor]),
            );
            extraArgs = [outType, outBuilding, outFloor];
            outputs = [outType, outBuilding, outFloor];
            break;
          }
          case "within": {
            result = c.createImmutableId();
            extraArgs = [result, "0"];
            outputs = [result];
            break;
          }
        }

        cursor.addInstruction(
          new NativeInstruction(
            ["ucontrol", overload, ...args, ...extraArgs],
            filterIds(args),
            outputs,
            loc,
          ),
        );

        return result;
      },
    });
    super(data);
  }
}
