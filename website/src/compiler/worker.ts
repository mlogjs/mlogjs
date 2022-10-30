import { Compiler } from "mlogjs";
import type { InputMessage, OutputMessage } from "./types";

self.addEventListener("message", (e: MessageEvent<InputMessage>) => {
  const { options, input, id } = e.data;
  try {
    const compiler = new Compiler(options);

    const data = compiler.compile(input);
    const [, error] = data;
    if (error) {
      // logs internal errors during dev mode
      if (
        import.meta.env.DEV &&
        error.inner &&
        error.inner.constructor.name !== "SyntaxError"
      ) {
        console.error(error.inner);
      }
      // worker messages don't copy stuff from the prototype chain
      // so this should make sure that the error is shared correctly
      data[1] = {
        loc: error.loc,
        inner: error.inner,
        name: error.name,
        message: error.message,
      };
    }

    const outMessage: OutputMessage = {
      data,
      id,
    };

    postMessage(outMessage);
  } catch (e) {
    (e as any).id = id;
    throw e;
  }
});
