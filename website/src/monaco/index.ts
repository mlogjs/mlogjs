import type { Monaco } from "../util";

export function loadMonaco(): Promise<Monaco> {
  return import("./monaco");
}

export { configureMlogLang } from "./mlog";
export { setMonacoTypescriptSettings } from "./typescript";
