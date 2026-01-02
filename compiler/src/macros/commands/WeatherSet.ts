import { NativeInstruction } from "../../flow";
import { MacroFunction } from "../Function";

export class WeatherSet extends MacroFunction {
  constructor() {
    super((c, cursor, loc, weather, state) => {
      cursor.addInstruction(
        new NativeInstruction(
          ["weatherset", weather, state],
          [weather, state],
          [],
          loc,
        ),
      );
      return c.nullId;
    });
  }
}
