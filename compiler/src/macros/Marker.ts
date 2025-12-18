import { IBlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import { ImmutableId, NativeInstruction } from "../flow";
import { Location } from "../types";
import { assertIsObjectMacro, assertObjectFields } from "../utils";
import { LiteralValue, ObjectValue } from "../values";
import { MacroFunction } from "./Function";
import { createOverloadNamespace } from "./util";

export class MarkerConstructor extends ObjectValue {
  constructor(c: ICompilerContext) {
    const data = createOverloadNamespace({
      c,
      overloads: {
        of: { args: ["id"] },
        shapeText: {
          named: "options",
          args: ["id", "x", "y", "replace"],
        },
        point: {
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
        quad: {
          named: "options",
          args: ["id", "x", "y", "replace"],
        },
      },

      handler(c, overload, cursor, loc, ...args) {
        // makemarker id line x y replace
        let id = args[0] as ImmutableId;
        const rest = args.slice(1);

        const marker = new MarkerMacro(c, id);

        if (overload !== "of") {
          cursor.addInstruction(
            new NativeInstruction(
              ["makemarker", overload, id, ...rest],
              [id, ...rest.filter(a => typeof a === "object")],
              [],
              loc,
            ),
          );
        }

        return c.registerValue(marker);
      },
    });
    super(data);
  }
}

const setterArgMap: Record<
  string,
  {
    props: string[];
    modify?: (args: (ImmutableId | string)[]) => (ImmutableId | string)[];
  }
> = {
  world: { props: [] },
  minimap: { props: [] },
  autoscale: { props: [] },
  pos: { props: ["x", "y"] },
  endPos: { props: ["x", "y"] },
  drawLayer: { props: [] },
  color: { props: [] },
  radius: { props: [] },
  stroke: { props: [] },
  rotation: { props: [] },
  shape: { props: ["sides", "fill", "outline"] },
  fontSize: { props: [] },
  textAlign: { props: [] },
  lineAlign: { props: [] },
  textHeight: { props: [] },
  outline: { props: [] },
  labelFlags: { props: ["background", "outline"] },
  texture: {
    props: [],
    modify(args) {
      return ["0", ...args];
    },
  },
  textureSize: { props: ["width", "height"] },
  posi: { props: ["index", "x", "y"] },
  uvi: { props: ["index", "x", "y"] },
  colori: { props: ["index", "color"] },
};

class MarkerMacro extends ObjectValue {
  constructor(
    c: ICompilerContext,
    public markerId: ImmutableId,
  ) {
    super(
      ObjectValue.autoRegisterData(c, {
        remove: new MacroFunction((c, cursor, loc) => {
          cursor.addInstruction(
            new NativeSetMarkerInstruction(markerId, "remove", loc),
          );
          return c.nullId;
        }),
        flushText: new MacroFunction((c, cursor, loc, optionsId) => {
          const options = c.getValue(optionsId);
          assertIsObjectMacro(options, "options");
          const [fetch] = assertObjectFields(c, options, ["fetch"]);
          cursor.addInstruction(
            new NativeSetMarkerInstruction(markerId, "flushText", loc, fetch),
          );

          return c.nullId;
        }),
        flushTexture: new MacroFunction((c, cursor, loc) => {
          cursor.addInstruction(
            new NativeSetMarkerInstruction(markerId, "texture", loc, "1"),
          );
          return c.nullId;
        }),
      }),
    );
  }

  set(
    c: ICompilerContext,
    cursor: IBlockCursor,
    targetId: ImmutableId,
    propId: ImmutableId,
    valueId: ImmutableId,
    loc: Location,
  ): void {
    const key = c.getValue(propId);

    if (key && super.hasProperty(c, key))
      throw new CompilerError(
        `The member [${key.debugString()}] is readonly in [${this.debugString()}]`,
      );

    if (
      !(key instanceof LiteralValue) ||
      !key.isString() ||
      !(key.data in setterArgMap)
    )
      throw new CompilerError(
        `The member [${key?.debugString()}] is not present in [${this.debugString()}]`,
      );

    const data = setterArgMap[key.data as keyof typeof setterArgMap];

    let args = [];
    if (data.props.length === 0) {
      args.push(valueId);
    } else {
      const options = c.getValue(valueId)!;

      for (const prop of data.props) {
        const memberId = options.get(
          c,
          cursor,
          valueId,
          c.registerValue(new LiteralValue(prop)),
          loc,
        );
        args.push(memberId);
      }
    }

    args = data.modify ? data.modify(args) : args;

    cursor.addInstruction(
      new NativeSetMarkerInstruction(this.markerId, key.data, loc, ...args),
    );
  }
}

class NativeSetMarkerInstruction extends NativeInstruction {
  constructor(
    public id: ImmutableId,
    public prop: string,
    loc: Location,
    ...args: (ImmutableId | string)[]
  ) {
    super(
      ["setmarker", prop, id, ...args],
      [id, ...args.filter(a => typeof a !== "string")],
      [],
      loc,
    );
  }
}
