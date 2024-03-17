import { CompilerError } from "../CompilerError";
import { InstructionBase } from "../instructions";
import { IInstruction, IValue } from "../types";
import { formatInstructionArgs, isTemplateObjectArray } from "../utils";
import { LiteralValue } from "../values";
import { MacroFunction } from "./Function";

export class Asm extends MacroFunction<null> {
  constructor() {
    super((scope, out, stringsArray, ...values) => {
      if (!isTemplateObjectArray(stringsArray))
        throw new CompilerError("Expected to receive a template strings array");

      const args: (string | IValue)[] = [];

      for (let i = 0; i < values.length; i++) {
        const [item] = stringsArray.get(scope, new LiteralValue(i)) as [
          LiteralValue<string>,
          never,
        ];

        args.push(item.data);
        args.push(values[i]);
      }

      const { length } = stringsArray.data;

      const [tail] = stringsArray.get(
        scope,
        new LiteralValue(length.data - 1),
      ) as [LiteralValue<string>, never];
      args.push(tail.data);

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
      instructions.push(new AsmInstruction(...params));
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
      instructions.push(new AsmInstruction(trimmed));
    }

    if (segments.length > 1) {
      buffer.push(segments[segments.length - 1]);
    }
  }

  if (buffer.length > 0 && validateInstructionArgs(buffer)) {
    instructions.push(new AsmInstruction(...buffer));
  }

  return instructions;
}

/**
 * Determines if an asm line should be generated and trims it at the start and
 * end
 */
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

class AsmInstruction extends InstructionBase {
  constructor(...args: (string | IValue)[]) {
    super(...args);

    const [first] = args;
    if (typeof first === "string") {
      this.ignoredByParser = /^\s*(#|\S+:)/.test(first);
    }
  }

  toString() {
    return formatInstructionArgs(this.args).join("");
  }
}
