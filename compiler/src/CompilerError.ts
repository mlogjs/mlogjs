import { es } from "./types";

export class CompilerError extends Error {
  constructor(message: string, public nodeStack: es.Node[] = []) {
    super(message);
  }
}
