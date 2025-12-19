import { NativeInstruction } from "../../flow";
import { InstructionBase } from "../../instructions";
import { StoreValue } from "../../values";
import { MacroFunction } from "../Function";

export class WeatherSense extends MacroFunction {
  constructor() {
    super((c, cursor, loc, weather) => {
      const state = c.createImmutableId();

      cursor.addInstruction(
        new NativeInstruction(
          ["weathersense", state, weather],
          [weather],
          [state],
          loc,
        ),
      );
      return state;
    });
  }
}
