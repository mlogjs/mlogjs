import { es } from "./types";

export class CompilerError extends Error {
  loc?: {
    line: number;
    column: number;
  };

  constructor(message: string, public nodeStack: es.Node[] = []) {
    super(message);
  }
}
