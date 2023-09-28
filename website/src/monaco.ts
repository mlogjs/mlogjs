import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

// based on
// https://github.com/vitejs/vite/discussions/1791#discussioncomment-321046
// the other workers were removed since the editor
// only needs the typescript language server
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

export * from "monaco-editor";
export default monaco;
