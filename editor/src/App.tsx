import "../style.css";
import Editor, { EditorProps, Monaco } from "@monaco-editor/react";
import { CompilerOptions } from "mlogjs";
import React, { Fragment, useEffect, useState } from "react";
import SplitPane from "react-split-pane";
import lib from "mlogjs/lib!raw";
import { editor } from "monaco-editor";
import { useCompiler } from "./hooks/useCompiler";
import { useSourceMapping } from "./hooks/useSourceMapping";

export function App() {
  const [options] = useState<CompilerOptions>({
    compactNames: true,
    sourcemap: true,
  });
  const [code, setCode] = useState(localStorage.getItem("code") ?? "");
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor>(null);
  const [monaco, setMonaco] = useState<Monaco>(null);
  const [compiled, sourcemaps] = useCompiler({ code, editor, options, monaco });
  const [outEditor, setOutEditor] =
    useState<editor.IStandaloneCodeEditor>(null);
  useSourceMapping({ editor, outEditor, sourcemaps });

  const onMount: EditorProps["onMount"] = (editor, monaco) => {
    const defaults = monaco.languages.typescript.typescriptDefaults;
    defaults.setCompilerOptions({
      noLib: true,
      allowNonTsExtensions: true,
    });
    for (const [name, content] of lib) {
      defaults.addExtraLib(content, name);
    }
    setEditor(editor);
    setMonaco(monaco);
  };

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
          onMount={editor => setOutEditor(editor)}
        ></Editor>
      </SplitPane>
    </Fragment>
  );
}
