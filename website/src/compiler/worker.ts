import { Compiler } from "mlogjs";
import type { InputMessage, OutputMessage } from "./types";

self.addEventListener("message", (e: MessageEvent<InputMessage>) => {
  const { options, input, id } = e.data;
  try {
    const compiler = new Compiler(options);

    const data = compiler.compile(input);

    if (data[1]) {
      // worker messages don't copy stuff from the prototype chain
      // so this should make sure that the error is shared correctly
      data[1] = {
        loc: data[1].loc,
        inner: data[1].inner,
        name: data[1].name,
        message: data[1].message,
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
