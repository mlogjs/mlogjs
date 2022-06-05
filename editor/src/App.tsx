import "../style.css";
import Editor, { EditorProps, Monaco } from "@monaco-editor/react";
import { CompilerOptions } from "mlogjs";
import React, { Fragment, useEffect, useState } from "react";
import SplitPane from "react-split-pane";
import lib from "mlogjs/lib!raw";
import { editor } from "monaco-editor";
import { compile } from "./compiler";

export function App() {
  const [options] = useState<CompilerOptions>({
    compactNames: true,
  });
  const [compiled, setCompiled] = useState("");
  const [code, setCode] = useState(localStorage.getItem("code") ?? "");
  const [monaco, setMonaco] = useState<Monaco>(null);
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor>(null);

  const onMount: EditorProps["onMount"] = (editor, monaco) => {
    const defaults = monaco.languages.typescript.typescriptDefaults;
    defaults.setCompilerOptions({
      noLib: true,
      allowNonTsExtensions: true,
    });
    for (const [name, content] of lib) {
      defaults.addExtraLib(content, name);
    }
    setMonaco(monaco);
    setEditor(editor);
  };

  useEffect(() => {
    let subscribed = true;

    async function compileAndShow() {
      if (!editor) return;
      const model = editor.getModel();
      const [output, error, [node]] = await compile(code, options);
      const markers: editor.IMarkerData[] = [];
      let content: string;
      if (error) {
        if (node) {
          const { start, end } = node.loc;
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
        localStorage.setItem("code", code);
        monaco.editor.setModelMarkers(model, "mlogjs", markers);
      }
    }

    compileAndShow();
    return () => {
      subscribed = false;
    };
  }, [code, editor]);

  return (
    <Fragment>
      <SplitPane
        split="horizontal"
        defaultSize="50%"
        style={{ backgroundColor: "gray" }}
      >
        <Editor
          onChange={setCode}
          language="typescript"
          onMount={onMount}
          value={code}
          theme={"vs-dark"}
        />
        <Editor
          value={compiled}
          options={{ readOnly: true, lineNumbers: n => `${n - 1}` }}
          theme={"vs-dark"}
        ></Editor>
      </SplitPane>
    </Fragment>
  );
}
