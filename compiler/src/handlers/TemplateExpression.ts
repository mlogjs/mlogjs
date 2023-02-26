import { CompilerError } from "../CompilerError";
import { THandler } from "../types";

export const TemplateLiteral: THandler<null> = () => {
  throw new CompilerError(
    "Template strings can only be used in tagged template literals. To inline mlog code use the asm function."
  );
};
