import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { setLibs } from "./typescript";
import { registerMlogLang } from "./mlog";

self.MonacoEnvironment = {
  getWorker(_, label) {
    switch (label) {
      case "javascript":
      case "typescript":
        return new tsWorker();
      default:
        return new editorWorker();
    }
  },
};

setLibs(monaco);
registerMlogLang(monaco);

export * from "monaco-editor";
