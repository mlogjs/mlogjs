import { CompilerOptions } from "mlogjs";
import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import { useEffect, useState } from "react";
import { compile } from "../compiler";
import { CompilerResult } from "../compiler/types";

interface Params {
  code: string;
  editor: editor.IStandaloneCodeEditor | null;
  options: CompilerOptions;
}

export function useCompiler({ code, editor, options }: Params) {
  const [compiled, setCompiled] = useState("");
  const [sourcemaps, setSourcemaps] = useState<CompilerResult[2]>(undefined);

  useEffect(() => {
    let subscribed = true;

    async function compileAndShow() {
      if (!editor) return;
      const model = editor.getModel();
      const [output, error, sourcemaps] = await compile(code, options);
      const markers: editor.IMarkerData[] = [];
      let content: string;
      if (error) {
        if (error.loc) {
          const { start, end } = error.loc;
          markers.push({
            message: error.message,
            startLineNumber: start.line,
            startColumn: start.column + 1,
            endLineNumber: end.line,
            endColumn: end.column + 1,
            severity: monaco.MarkerSeverity.Error,
          });
        }
        content = error.message;
      } else {
        content = output;
      }
      if (subscribed) {
        setCompiled(content);
        setSourcemaps(sourcemaps);
        localStorage.setItem("code", code);
        monaco.editor.setModelMarkers(model, "mlogjs", markers);
      }
    }

    compileAndShow();
    return () => {
      subscribed = false;
    };
  }, [code, editor]);

  return [compiled, sourcemaps] as const;
}
