import { InstructionBase } from "../instructions";
import { IScope, IValue } from "../types";
import { LiteralValue, ObjectValue, StoreValue, TempValue } from "../values";
import { MacroFunction } from "./Function";

class Block extends ObjectValue {
  name: string;
  toString() {
    return this.name;
  }
  constructor(scope: IScope, name: string) {
    super(scope, {
      $get: new MacroFunction(scope, (prop: IValue) => {
        let obj: ObjectValue;
        if (prop instanceof LiteralValue && typeof prop.data === "string") {
          obj = new ObjectValue(scope, {
            $eval: new MacroFunction(scope, () => {
              return this.get(scope, new LiteralValue(scope, "sensor"))[0].call(
                scope,
                [prop]
              );
            }),
            "$=": new MacroFunction(scope, (value: IValue) => {
              return this.get(
                scope,
                new LiteralValue(scope, "control")
              )[0].call(scope, [prop, value]);
            }),
          });
        } else {
          obj = new ObjectValue(scope, {
            $eval: new MacroFunction(scope, () => {
              return this.get(scope, new LiteralValue(scope, "read"))[0].call(
                scope,
                [prop]
              );
            }),
            "$=": new MacroFunction(scope, (value: IValue) => {
              return this.get(scope, new LiteralValue(scope, "write"))[0].call(
                scope,
                [prop, value]
              );
            }),
          });
        }
        return [obj, []];
      }),
      puts: new MacroFunction(scope, (...args) => {
        return [
          null,
          [
            ...args.map(arg => new InstructionBase("print", arg)),
            new InstructionBase("printflush", name),
          ],
        ];
      }),
      printFlush: new MacroFunction(scope, () => {
        return [null, [new InstructionBase("printflush", name)]];
      }),
      drawFlush: new MacroFunction(scope, () => {
        return [null, [new InstructionBase("drawflush", name)]];
      }),
      read: new MacroFunction(scope, (i: IValue) => {
        if (!(i instanceof LiteralValue || i instanceof StoreValue))
          throw new Error("Cannot read at non-literal or non-store index.");
        const temp = new TempValue(scope);
        return [temp, [new InstructionBase("read", temp, name, i)]];
      }),
      write: new MacroFunction(scope, (i: IValue, value: IValue) => {
        if (!(i instanceof LiteralValue || i instanceof StoreValue))
          throw new Error("Cannot write at non-literal or non-store index.");
        if (!(value instanceof LiteralValue || value instanceof StoreValue))
          throw new Error("Cannot write a non-literal or non-store value.");
        return [value, [new InstructionBase("write", value, name, i)]];
      }),
      // sensor result block1 @copper
      sensor: new MacroFunction(scope, (attr: IValue) => {
        if (!(attr instanceof LiteralValue))
          throw new Error("Cannot use sensor with non-literal attribute.");
        if (typeof attr.data !== "string")
          throw new Error("Cannot use sensor with non-string attribute.");
        if (attr.data[0] === "@")
          throw new Error(
            "The use of '@' is unnecessary beucase it is already done for you."
          );
        const temp = new TempValue(scope);
        return [
          temp,
          [new InstructionBase("sensor", temp, name, "@" + attr.data)],
        ];
      }),
      //control enabled block1 0 0 0 0
      control: new MacroFunction(scope, (attr: IValue, ...args: IValue[]) => {
        if (!(attr instanceof LiteralValue))
          throw new Error("Cannot use control with non-literal attribute.");
        if (
          ["enabled", "shoot", "shootp", "configure", "color"].indexOf(
            attr.data as string
          ) === -1
        )
          throw new Error("Control attribute must be valid.");
        for (const arg of args)
          if (!(arg instanceof LiteralValue || arg instanceof StoreValue))
            throw new Error(
              "Arguments cannot be non-literal or non-store value."
            );
        return [
          null,
          [new InstructionBase("control", attr.data as string, name, ...args)],
        ];
      }),
      // radar enemy any any distance turret1 1 result
      radar: new MacroFunction(
        scope,
        (
          target0: IValue,
          target1: IValue,
          target2: IValue,
          sort: IValue,
          order: IValue
        ) => {
          const targets = [target0, target1, target2];
          for (const target of targets) {
            if (!(target instanceof LiteralValue))
              throw new Error("Radar targets cannot be non-literal.");
            if (
              [
                "any",
                "enemy",
                "ally",
                "player",
                "attacker",
                "flying",
                "boss",
                "ground",
              ].indexOf(target.data as string) === -1
            )
              throw new Error("Radar target must be valid.");
          }
          if (!(sort instanceof LiteralValue))
            throw new Error("Radar sort cannot be non-literal.");
          if (
            ["distance", "health", "shield", "armor", "maxHealth"].indexOf(
              sort.data as string
            ) === -1
          )
            throw new Error("Radar sort must be valid");

          if (!(order instanceof LiteralValue || order instanceof StoreValue))
            throw new Error(
              "Arguments cannot be non-literal or non-store value."
            );
          const temp = new TempValue(scope);
          return [
            temp,
            [
              new InstructionBase(
                "radar",
                ...targets.map(v => (<LiteralValue>v).data as string),
                sort.data as string,
                name,
                order,
                temp
              ),
            ],
          ];
        }
      ),
    });
    this.name = name;
  }
}

export class BlockBuilder extends ObjectValue {
  constructor(scope: IScope) {
    super(scope, {
      $call: new MacroFunction(scope, (nameLit: IValue) => {
        if (!(nameLit instanceof LiteralValue))
          throw new Error("Block name must be a literal.");
        if (typeof nameLit.data !== "string")
          throw new Error("Block name must be a string.");
        return [new Block(scope, nameLit.data), []];
      }),
    });
  }
}
