import "./style.css";
import Editor, { EditorProps, Monaco } from "@monaco-editor/react";
import { compile } from "../src";
import React, { Fragment, useEffect, useState } from "react";
import SplitPane from "react-split-pane";
import lib from "../lib!raw";
import { editor } from "monaco-editor";

export function App() {
  const [compiled, setCompiled] = useState("");
  const [code, setCode] = useState(localStorage.getItem("code") ?? "");
  const [monaco, setMonaco] = useState<Monaco>(null);
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor>(null);

  const onMount: EditorProps["onMount"] = (editor, monaco) => {
    const defaults = monaco.languages.typescript.javascriptDefaults;
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

  function compileAndShow() {
    if (!editor) return;
    const model = editor.getModel();
    const [output, error, nodes] = compile(code);
    const markers: editor.IMarkerData[] = [];
    if (error) {
      if (nodes[0]) {
        const { start, end } = nodes[0].loc;
        markers.push({
          message: error.message,
          startLineNumber: start.line,
          startColumn: start.column + 1,
          endLineNumber: end.line,
          endColumn: end.column + 1,
          severity: monaco.MarkerSeverity.Error,
        });
      }
      setCompiled(error.message);
    } else {
      setCompiled(output);
    }
    localStorage.setItem("code", code);
    monaco.editor.setModelMarkers(model, "mlogjs", markers);
  }

  useEffect(compileAndShow, [code, editor]);

  return (
    <Fragment>
      <SplitPane split="horizontal" defaultSize="50%">
        <Editor
          onChange={setCode}
          language="javascript"
          onMount={onMount}
          value={code}
        />
        <Editor value={compiled} options={{ readOnly: true }}></Editor>
      </SplitPane>
    </Fragment>
  );
}
