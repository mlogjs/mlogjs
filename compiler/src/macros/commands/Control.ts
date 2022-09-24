import { InstructionBase } from "../../instructions";
import { MacroFunction } from "..";
import { IScope } from "../../types";
import { assertIsObjectMacro, assertObjectFields } from "../../assertions";
import { ObjectValue } from "../../values";

export class Control extends ObjectValue {
  constructor(scope: IScope) {
    const genericHandler = new MacroFunction(scope, (...args) => [
      null,
      [new InstructionBase("control", ...args)],
    ]);

    super(scope, {
      enabled: genericHandler,
      config: genericHandler,
      color: genericHandler,
      shoot: new MacroFunction(scope, options => {
        assertIsObjectMacro(options, "The shoot options");

        const params = assertObjectFields(options, [
          "building",
          "x",
          "y",
          "shoot",
        ]);
        return [null, [new InstructionBase("control", ...params)]];
      }),

      shootp: new MacroFunction(scope, options => {
        assertIsObjectMacro(options, "The shootp options");

        const params = assertObjectFields(options, [
          "building",
          "unit",
          "shoot",
        ]);
        return [null, [new InstructionBase("control", ...params)]];
      }),
    });
  }
}
