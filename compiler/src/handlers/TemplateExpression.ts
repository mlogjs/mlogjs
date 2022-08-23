import { CompilerError } from "../CompilerError";
import { THandler } from "../types";

export const TemplateLiteral: THandler<null> = () => {
  throw new CompilerError(
    "Template strings are currently unavailable. To inline mlog code use the asm function."
  );
};
