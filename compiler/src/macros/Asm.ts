import { CompilerError } from "../CompilerError";
import { ZeroSpaceInstruction } from "../instructions";
import { IInstruction, IScope, IValue } from "../types";
import { isTemplateObjectArray } from "../utils";
import { LiteralValue } from "../values";
import { MacroFunction } from "./Function";

export class Asm extends MacroFunction<null> {
  constructor(scope: IScope) {
    super(scope, (stringsArray, ...values) => {
      if (!isTemplateObjectArray(stringsArray))
        throw new CompilerError("Expected to receive a template strings array");

      const args: (string | IValue)[] = [];

      for (let i = 0; i < values.length; i++) {
        const [item] = stringsArray.get(scope, new LiteralValue(scope, i)) as [
          LiteralValue,
          never
        ];

        args.push(item.data as string);
        args.push(values[i]);
      }

      const { length } = stringsArray.data;

      const [tail] = stringsArray.get(
        scope,
        new LiteralValue(scope, length.data - 1)
      ) as [LiteralValue, never];
      args.push(tail.data as string);

      return [null, formatInstructions(args)];
    });
  }
}

/** Splits multiline asm calls and formats each line. */
function formatInstructions(args: (string | IValue)[]) {
  const instructions: IInstruction[] = [];

  let buffer: (string | IValue)[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (typeof arg !== "string" || !arg.includes("\n")) {
      buffer.push(arg);
      continue;
    }

    const segments = arg.split("\n");

    const params = [...buffer, segments[0]];

    if (validateInstructionArgs(params)) {
      instructions.push(new ZeroSpaceInstruction(...params));
      buffer = [];
    }

    // iterates over all segments except the first and last
    // the first segment was already processed above
    // the last segment will be added to the buffer because there might
    // be an interpolation after it
    // and putting it in the buffer makes sure it has a proper output format
    for (let i = 1; i < segments.length - 1; i++) {
      const trimmed = segments[i].trim();
      if (trimmed.length == 0) continue;
      instructions.push(new ZeroSpaceInstruction(trimmed));
    }

    if (segments.length > 1) {
      buffer.push(segments[segments.length - 1]);
    }
  }

  if (buffer.length > 0 && validateInstructionArgs(buffer)) {
    instructions.push(new ZeroSpaceInstruction(...buffer));
  }

  return instructions;
}

/** Determines if an asm line should be generated and trims it at the start and end */
function validateInstructionArgs(args: (string | IValue)[]) {
  if (args.length === 0) return false;
  if (args.length === 1) {
    const item = args[0];
    if (typeof item !== "string") return true;
    args[0] = item.trim();
    return args[0].length !== 0;
  }

  const first = args[0];
  const last = args[args.length - 1];
  if (typeof first === "string") args[0] = first.trimStart();
  if (typeof last === "string") args[args.length - 1] = last.trimEnd();
  return true;
}
