import { InstructionBase } from "../../instructions";
import { MacroFunction } from "../Function";

export class WeatherSet extends MacroFunction<null> {
  constructor() {
    super((scope, out, weather, state) => {
      return [null, [new InstructionBase("weathersense", weather, state)]];
    });
  }
}
