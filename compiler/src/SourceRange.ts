import { es } from "./types";

export class SourcePosition {
  constructor(
    public line: number,
    public column: number,
  ) {}
}

export class SourceRange {
  constructor(
    public start: SourcePosition,
    public end: SourcePosition,
  ) {}

  static fromNode(node: es.Node): SourceRange {
    return SourceRange.fromLocation(node.loc!);
  }

  static fromLocation(loc: es.SourceLocation): SourceRange {
    return new SourceRange(
      new SourcePosition(loc.start.line, loc.start.column),
      new SourcePosition(loc.end.line, loc.end.column),
    );
  }
}
