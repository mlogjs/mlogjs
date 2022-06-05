import { Compiler } from "mlogjs";
import { InputMessage, OutputMessage } from "./types";

self.addEventListener("message", (e: MessageEvent<InputMessage>) => {
  const { options, input, id } = e.data;
  try {
    const compiler = new Compiler(options);

    const outMessage: OutputMessage = {
      data: compiler.compile(input),
      id,
    };

    postMessage(outMessage);
  } catch (e) {
    e.id = id;
    throw e;
  }
});
