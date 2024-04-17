import { Location, es } from "./types";

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

type CompilerErrorSource =
  | Location
  | es.SourceLocation
  | {
      line: number;
      column: number;
    };

export interface CompilerErrorLoc {
  start: {
    line: number;
    column: number;
  };
  end: {
    line: number;
    column: number;
  };
}

export class CompilerError extends Error {
  protected _loc?: CompilerErrorLoc;
  /**
   * The error that preceded this `CompilerError`.
   *
   * If it's not `undefined` it means that `this` is just wrapping the error to
   * append extra data like the node stack
   */
  inner?: unknown;

  constructor(message: string, source?: CompilerErrorSource) {
    super(message);

    this.loc = source;
  }

  get loc(): CompilerErrorLoc | undefined {
    return this._loc;
  }

  set loc(value: CompilerErrorSource | undefined) {
    if (!value) return;
    if ("start" in value) {
      this._loc = value;
    } else if ("line" in value) {
      this._loc = {
        start: value,
        end: value,
      };
    } else {
      this._loc = value.loc!;
    }
  }

  static from(error: unknown, source?: CompilerErrorSource) {
    let message: string;

    if (error && typeof error === "object" && "loc" in error) {
      const err = error as ParsingError;
      message = err.toString();
      source ??= err.loc;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else {
      message = `Unknown error: ${error}`;
    }
    const result = new CompilerError(message, source);
    result.inner = error;
    return result;
  }
}
