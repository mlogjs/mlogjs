import { IBlockCursor } from "../BlockCursor";
import { ICompilerContext } from "../CompilerContext";
import { CompilerError } from "../CompilerError";
import { ImmutableId, isImmutableId } from "../flow";
import { SourceRange } from "../SourceRange";
import {
  assertIsObjectMacro,
  assertObjectFields,
  IParameterDescriptor,
} from "../utils";
import { ObjectValue } from "../values";
import { MacroFunction } from "./Function";

interface IOverloadNamespaceOptions<K extends string> {
  c: ICompilerContext;
  overloads: Record<
    K,
    {
      /**
       * Pass the name of the options argument to tell if this overload uses
       * named parameters.
       */
      named?: string;
      args: (IParameterDescriptor | string)[];
    }
  >;

  handler(
    this: void,
    c: ICompilerContext,
    overload: K,
    cursor: IBlockCursor,
    loc: SourceRange,
    ...args: (ImmutableId | string)[]
  ): ImmutableId;
}

/**
 * Used to create namespaces that contain multiple methods that map into
 * instructions
 */
export function createOverloadNamespace<K extends string>({
  c,
  overloads,
  handler,
}: IOverloadNamespaceOptions<K>) {
  const result: Record<string, MacroFunction> = {};

  for (const key in overloads) {
    const { named, args } = overloads[key];
    if (named) {
      result[key] = new MacroFunction((c, cursor, loc, optionsId) => {
        const options = c.getValue(optionsId);
        assertIsObjectMacro(options, named);

        return handler(
          c,
          key,
          cursor,
          loc,
          ...assertObjectFields(c, options, args),
        );
      });
      continue;
    }

    result[key] = new MacroFunction((c, cursor, loc, ...params) => {
      const handlerParams: (ImmutableId | string)[] = [];
      // validate the paramters
      for (let i = 0; i < args.length; i++) {
        let arg = args[i];
        if (typeof arg === "string") arg = { key: arg };

        const paramId = params[i];

        if (!paramId) {
          if (arg.default == undefined)
            throw new CompilerError(`Missing argument: ${arg.name ?? arg.key}`);
          handlerParams.push(arg.default);
          continue;
        }

        arg.validate?.(c.getValueOrTemp(paramId));
        handlerParams.push(paramId);
      }

      return handler(c, key, cursor, loc, ...handlerParams);
    });
  }

  return ObjectValue.autoRegisterData(c, result);
}

export function filterIds(args: (ImmutableId | string)[]): ImmutableId[] {
  return args.filter(isImmutableId);
}
