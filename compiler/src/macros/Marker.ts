import { InstructionBase } from "../instructions";
import { IInstruction, IScope, IValue, TValueInstructions } from "../types";
import { pipeInsts } from "../utils";
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
          inst.push(new InstructionBase("makemarker", id, overload, ...rest));
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
      remove: new MarkerMacroMethod(id, "remove"),
      visible: new MarkerMacroSetter(id, "setVisibility"),
      toggleVisibility: new MarkerMacroMethod(id, "toggleVisibility"),
      text: new MarkerMacroSetter(id, "text"),
      flushText: new MarkerMacroMethod(id, "flushText"),
      x: new MarkerMacroSetter(id, "x"),
      y: new MarkerMacroSetter(id, "y"),
      pos: new MarkerMacroSetter(id, "pos", ["x", "y"]),
      endX: new MarkerMacroSetter(id, "endX"),
      endY: new MarkerMacroSetter(id, "endY"),
      endPos: new MarkerMacroSetter(id, "endPos", ["x", "y"]),
      fontSize: new MarkerMacroSetter(id, "fontSize"),
      textHeight: new MarkerMacroSetter(id, "textHeight"),
      labelBackground: new MarkerMacroSetter(id, "labelBackground"),
      labelOutline: new MarkerMacroSetter(id, "labelOutline"),
      labelFlags: new MarkerMacroSetter(id, "labelFlags", [
        "background",
        "outline",
      ]),
      radius: new MarkerMacroSetter(id, "radius"),
      stroke: new MarkerMacroSetter(id, "stroke"),
      rotation: new MarkerMacroSetter(id, "rotation"),
      shapeSides: new MarkerMacroSetter(id, "shapeSides"),
      shapeFill: new MarkerMacroSetter(id, "shapeFill"),
      shapeOutline: new MarkerMacroSetter(id, "shapeOutline"),
      setShape: new MarkerMacroSetter(id, "setShape", [
        "sides",
        "fill",
        "outline",
      ]),
      color: new MarkerMacroSetter(id, "color"),
    });
  }
}

class MarkerMacroSetter extends VoidValue {
  constructor(
    public id: IValue,
    public prop: string,
    public keys: string[] = [],
  ) {
    super();
  }

  "="(scope: IScope, value: IValue): TValueInstructions {
    const inst: IInstruction[] = [];
    if (this.keys.length === 0) {
      inst.push(new InstructionBase("setmarker", this.prop, this.id, value));
    } else {
      const members: IValue[] = [];
      for (const key of this.keys) {
        const member = pipeInsts(value.get(scope, new LiteralValue(key)), inst);
        members.push(member);
      }
      inst.push(
        new InstructionBase("setmarker", this.prop, this.id, ...members),
      );
    }

    return [value, inst];
  }
}

class MarkerMacroMethod extends MacroFunction<null> {
  constructor(
    public id: IValue,
    public prop: string,
  ) {
    super(() => {
      return [null, [new InstructionBase("setmarker", id, prop)]];
    });
  }
}
