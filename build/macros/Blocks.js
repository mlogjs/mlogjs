"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockBuilder = void 0;
const instructions_1 = require("../instructions");
const values_1 = require("../values");
const Function_1 = require("./Function");
class Block extends values_1.ObjectValue {
    constructor(scope, name) {
        super(scope, {
            $get: new Function_1.MacroFunction(scope, (prop) => {
                let obj;
                if (prop instanceof values_1.LiteralValue && typeof prop.data === "string") {
                    obj = new values_1.ObjectValue(scope, {
                        $eval: new Function_1.MacroFunction(scope, () => {
                            return this.get(scope, new values_1.LiteralValue(scope, "sensor"))[0].call(scope, [prop]);
                        }),
                        "$=": new Function_1.MacroFunction(scope, (value) => {
                            return this.get(scope, new values_1.LiteralValue(scope, "control"))[0].call(scope, [prop, value]);
                        })
                    });
                }
                else {
                    obj = new values_1.ObjectValue(scope, {
                        $eval: new Function_1.MacroFunction(scope, () => {
                            return this.get(scope, new values_1.LiteralValue(scope, "read"))[0].call(scope, [prop]);
                        }),
                        "$=": new Function_1.MacroFunction(scope, (value) => {
                            return this.get(scope, new values_1.LiteralValue(scope, "write"))[0].call(scope, [prop, value]);
                        })
                    });
                }
                return [obj, []];
            }),
            puts: new Function_1.MacroFunction(scope, (...args) => {
                return [
                    null,
                    [
                        ...args.map((arg) => new instructions_1.InstructionBase("print", arg)),
                        new instructions_1.InstructionBase("printflush", name),
                    ],
                ];
            }),
            printFlush: new Function_1.MacroFunction(scope, () => {
                return [null, [new instructions_1.InstructionBase("printflush", name)]];
            }),
            drawFlush: new Function_1.MacroFunction(scope, () => {
                return [null, [new instructions_1.InstructionBase("drawflush", name)]];
            }),
            read: new Function_1.MacroFunction(scope, (i) => {
                if (!(i instanceof values_1.LiteralValue || i instanceof values_1.StoreValue))
                    throw new Error("Cannot read at non-literal or non-store index.");
                const temp = new values_1.TempValue(scope);
                return [temp, [new instructions_1.InstructionBase("read", temp, name, i)]];
            }),
            write: new Function_1.MacroFunction(scope, (i, value) => {
                if (!(i instanceof values_1.LiteralValue || i instanceof values_1.StoreValue))
                    throw new Error("Cannot write at non-literal or non-store index.");
                if (!(value instanceof values_1.LiteralValue || value instanceof values_1.StoreValue))
                    throw new Error("Cannot write a non-literal or non-store value.");
                return [value, [new instructions_1.InstructionBase("write", value, name, i)]];
            }),
            // sensor result block1 @copper
            sensor: new Function_1.MacroFunction(scope, (attr) => {
                if (!(attr instanceof values_1.LiteralValue))
                    throw new Error("Cannot use sensor with non-literal attribute.");
                if (typeof attr.data !== "string")
                    throw new Error("Cannot use sensor with non-string attribute.");
                if (attr.data[0] === "@")
                    throw new Error("The use of '@' is unnecessary beucase it is already done for you.");
                const temp = new values_1.TempValue(scope);
                return [temp, [new instructions_1.InstructionBase("sensor", temp, name, attr.data)]];
            }),
            //control enabled block1 0 0 0 0
            control: new Function_1.MacroFunction(scope, (attr, ...args) => {
                if (!(attr instanceof values_1.LiteralValue))
                    throw new Error("Cannot use control with non-literal attribute.");
                if (["enabled", "shoot", "shootp", "configure", "color"].indexOf(attr.data) === -1)
                    throw new Error("Control attribute must be valid.");
                for (const arg of args)
                    if (!(arg instanceof values_1.LiteralValue || arg instanceof values_1.StoreValue))
                        throw new Error("Arguments cannot be non-literal or non-store value.");
                return [null, [new instructions_1.InstructionBase("control", attr.data, name, ...args)]];
            }),
            // radar enemy any any distance turret1 1 result
            radar: new Function_1.MacroFunction(scope, (target0, target1, target2, sort, order) => {
                const targets = [target0, target1, target2];
                for (const target of targets) {
                    if (!(target instanceof values_1.LiteralValue))
                        throw new Error("Radar targets cannot be non-literal.");
                    if ([
                        "any",
                        "enemy",
                        "ally",
                        "player",
                        "attacker",
                        "flying",
                        "boss",
                        "ground",
                    ].indexOf(target.data) === -1)
                        throw new Error("Radar target must be valid.");
                }
                if (!(sort instanceof values_1.LiteralValue))
                    throw new Error("Radar sort cannot be non-literal.");
                if (["distance", "health", "shield", "armor", "maxHealth"].indexOf(sort.data) === -1)
                    throw new Error("Radar sort must be valid");
                if (!(order instanceof values_1.LiteralValue || order instanceof values_1.StoreValue))
                    throw new Error("Arguments cannot be non-literal or non-store value.");
                const temp = new values_1.TempValue(scope);
                return [
                    temp,
                    [
                        new instructions_1.InstructionBase("radar", ...targets.map((v) => v.data), sort.data, name, order, temp),
                    ],
                ];
            }),
        });
        this.name = name;
    }
}
class BlockBuilder extends values_1.ObjectValue {
    constructor(scope) {
        super(scope, {
            $call: new Function_1.MacroFunction(scope, (nameLit) => {
                if (!(nameLit instanceof values_1.LiteralValue))
                    throw new Error("Block name must be a literal.");
                if (typeof nameLit.data !== "string")
                    throw new Error("Block name must be a string.");
                return [new Block(scope, nameLit.data), []];
            }),
        });
    }
}
exports.BlockBuilder = BlockBuilder;
//# sourceMappingURL=Blocks.js.map