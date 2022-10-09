import {
  assertIsObjectMacro,
  assertObjectFields,
  IParameterDescriptor,
} from "../assertions";
import { CompilerError } from "../CompilerError";
import { IScope, IValue, TValueInstructions } from "../types";
import { MacroFunction } from "./Function";

interface IOverloadNamespaceOptions<K extends string> {
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
    scope: IScope,
    overload: K,
    ...args: (IValue | string)[]
  ): TValueInstructions<IValue | null>;
}

/** Used to create namespaces that contain multiple methods that map into instructions */
export function createOverloadNamespace<K extends string>({
  overloads,
  handler,
}: IOverloadNamespaceOptions<K>) {
  const result: Record<string, MacroFunction<IValue | null>> = {};

  for (const key in overloads) {
    const { named, args } = overloads[key];
    if (named) {
      result[key] = new MacroFunction((scope, options) => {
        assertIsObjectMacro(options, named);

        return handler(scope, key, ...assertObjectFields(options, args));
      });
      continue;
    }

    result[key] = new MacroFunction((scope, ...params) => {
      const handlerParams: (IValue | string)[] = [];
      // validate the paramters
      for (let i = 0; i < args.length; i++) {
        let arg = args[i];
        if (typeof arg === "string") arg = { key: arg };

        const param = params[i];

        if (!param) {
          if (arg.default == undefined)
            throw new CompilerError(`Missing argument: ${arg.name ?? arg.key}`);
          handlerParams.push(arg.default);
          continue;
        }

        arg.validate?.(param);
        handlerParams.push(param);
      }

      return handler(scope, key, ...handlerParams);
    });
  }

  return result;
}
