import type { CompilerOptions } from "mlogjs";
import type { CompilerResult, InputMessage, OutputMessage } from "./types";

let worker: Worker;

/**
 * Invokes a web worker to compile the code. It will throttle any calls that
 * @param code
 * @param options
 */
export async function compile(
  code: string,
  options: CompilerOptions
): Promise<CompilerResult> {
  // cuz vite insists on doing ssr
  worker ??= new Worker(new URL("./worker.ts", import.meta.url), {
    name: "mlogjs-compiler",
    type: "module",
  });

  const inputMessage: InputMessage = {
    id: generateId(),
    input: code,
    options,
  };

  const promise = new Promise<CompilerResult>((resolve, reject) => {
    const onMessage = (e: MessageEvent<OutputMessage>) => {
      const { id, data } = e.data;
      if (id !== inputMessage.id) return;
      e.stopPropagation();
      worker.removeEventListener("message", onMessage);
      resolve(data);
    };

    const onError = (e: ErrorEvent) => {
      if (e.error.id !== inputMessage.id) return;
      e.stopPropagation();
      worker.removeEventListener("error", onError);
      reject(e.error);
    };

    const onMessageError = (e: MessageEvent<OutputMessage>) => {
      const { id, data } = e.data;
      if (id !== inputMessage.id) return;
      e.stopPropagation();
      worker.removeEventListener("messageerror", onMessageError);
      reject(new Error(`Invalid worker input message: ${data}`));
    };

    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    worker.addEventListener("messageerror", onMessageError);
  });

  worker.postMessage(inputMessage);

  return await promise;
}

function generateId() {
  const prefix = new Date().getTime().toString(36);
  const suffix = Math.floor(Math.random() * 100).toString(36);

  return `${prefix}${suffix}`;
}
