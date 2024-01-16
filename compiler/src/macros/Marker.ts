import { InstructionBase } from "../instructions";
import { IInstruction, IScope, IValue, TValueInstructions } from "../types";
import { assertIsObjectMacro, assertObjectFields, pipeInsts } from "../utils";
import { LiteralValue, ObjectValue, StoreValue, VoidValue } from "../values";
import { MacroFunction } from "./Function";
import { createOverloadNamespace } from "./util";

export class MarkerConstructor extends ObjectValue {
  constructor() {
    const data = createOverloadNamespace({
      overloads: {
        of: { args: ["id"] },
        shapeText: {
          named: "options",
          args: ["id", "x", "y", "replace"],
        },
        minimap: {
          named: "options",
          args: ["id", "x", "y", "replace"],
        },
        shape: {
          named: "options",
          args: ["id", "x", "y", "replace"],
        },
        line: {
          named: "options",
          args: ["id", "x", "y", "replace"],
        },
        text: {
          named: "options",
          args: ["id", "x", "y", "replace"],
        },
        texture: {
          named: "options",
          args: ["id", "x", "y", "replace"],
        },
      },

      handler(scope, overload, out, ...args) {
        // makemarker id line x y replace

        const inst: IInstruction[] = [];
        let id = args[0] as IValue;

        const rest = args.slice(1);

        if (!(id instanceof LiteralValue)) {
          // prevent mutations to the source
          // from affecting the object's internal value
          const store = StoreValue.from(scope);
          pipeInsts(store["="](scope, id), inst);
          id = store;
        }
        const marker = new MarkerMacro(id);

        if (overload !== "of") {
          inst.push(new InstructionBase("makemarker", overload, id, ...rest));
        }
        return [marker, inst];
      },
    });
    super(data);
  }
}

class MarkerMacro extends ObjectValue {
  constructor(id: IValue) {
    super({
      remove: new MacroFunction(() => [null, [setmarker(id, "remove")]]),
      visible: new MarkerMacroSetter(id, "visibility"),
      minimap: new MarkerMacroSetter(id, "minimap"),
      autoscale: new MarkerMacroSetter(id, "autoscale"),
      pos: new MarkerMacroSetter(id, "pos", ["x", "y"]),
      endPos: new MarkerMacroSetter(id, "endPos", ["x", "y"]),
      drawLayer: new MarkerMacroSetter(id, "drawLayer"),
      color: new MarkerMacroSetter(id, "color"),
      radius: new MarkerMacroSetter(id, "radius"),
      stroke: new MarkerMacroSetter(id, "stroke"),
      rotation: new MarkerMacroSetter(id, "rotation"),
      shape: new MarkerMacroSetter(id, "shape", ["sides", "fill", "outline"]),
      flushText: new MacroFunction((scope, out, options) => {
        assertIsObjectMacro(options, "options");
        const [fetch] = assertObjectFields(options, ["fetch"]);
        return [null, [setmarker(id, "flushText", fetch)]];
      }),
      fontSize: new MarkerMacroSetter(id, "fontSize"),
      textHeight: new MarkerMacroSetter(id, "textHeight"),
      labelFlags: new MarkerMacroSetter(id, "labelFlags", [
        "background",
        "outline",
      ]),
      texture: new MarkerMacroSetter(id, "texture", [], args => ["0", ...args]),
      flushTexture: new MacroFunction(() => [
        null,
        [setmarker(id, "texture", "1")],
      ]),
      textureSize: new MarkerMacroSetter(id, "textureSize", [
        "width",
        "height",
      ]),
    });
  }
}

class MarkerMacroSetter extends VoidValue {
  constructor(
    public id: IValue,
    public prop: string,
    public keys: string[] = [],
    public modifyArgs?: (args: IValue[]) => (IValue | string)[],
  ) {
    super();
  }

  "="(scope: IScope, value: IValue): TValueInstructions {
    const inst: IInstruction[] = [];
    let args = [];
    if (this.keys.length === 0) {
      args.push(value);
    } else {
      for (const key of this.keys) {
        const member = pipeInsts(value.get(scope, new LiteralValue(key)), inst);
        args.push(member);
      }
    }

    if (this.modifyArgs) {
      args = this.modifyArgs(args);
    }

    inst.push(setmarker(this.id, this.prop, ...args));

    return [value, inst];
  }
}

function setmarker(id: IValue, prop: string, ...args: (IValue | string)[]) {
  return new InstructionBase("setmarker", prop, id, ...args);
}
