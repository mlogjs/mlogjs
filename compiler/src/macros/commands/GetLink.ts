import { MacroFunction } from "..";
import { CompilerError } from "../../CompilerError";
import { NativeInstruction } from "../../flow";

export class GetLink extends MacroFunction {
  constructor() {
    super((c, cursor, loc, index) => {
      if (!index) throw new CompilerError("Missing parameter: index", loc);
      const outBuild = c.createImmutableId();

      cursor.addInstruction(
        new NativeInstruction(
          ["getlink", outBuild, index],
          [index],
          [outBuild],
          loc,
        ),
      );
      return outBuild;
    });
  }
}
