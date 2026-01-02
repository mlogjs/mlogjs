import { SourcePosition, SourceRange } from "./SourceRange";

/**
 * Error thrown by the babel parser.
 *
 * It doesn't export the type so we are writing it ourselves
 */
export interface ParsingError extends Error {
  code: string;
  reasonCode: string;
  loc: {
    line: number;
    column: number;
  };
}

export class CompilerError extends Error {
  /**
   * The error that preceded this `CompilerError`.
   *
   * If it's not `undefined` it means that `this` is just wrapping the error to
   * append extra data like the node stack
   */
  inner?: unknown;

  constructor(
    message: string,
    public loc?: SourceRange,
  ) {
    super(message);
  }

  static from(error: unknown, loc?: SourceRange) {
    let message: string;

    if (error && typeof error === "object" && "loc" in error) {
      const err = error as ParsingError;
      message = err.toString();
      const pos = new SourcePosition(err.loc.line, err.loc.column);
      loc = new SourceRange(pos, pos);
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else {
      message = `Unknown error: ${error}`;
    }
    const result = new CompilerError(message, loc);
    result.inner = error;
    return result;
  }
}
