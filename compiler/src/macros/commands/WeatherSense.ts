import { InstructionBase } from "../../instructions";
import { StoreValue } from "../../values";
import { MacroFunction } from "../Function";

export class WeatherSense extends MacroFunction {
  constructor() {
    super((scope, out, weather) => {
      const state = StoreValue.from(scope, out);

      return [state, [new InstructionBase("weathersense", state, weather)]];
    });
  }
}
