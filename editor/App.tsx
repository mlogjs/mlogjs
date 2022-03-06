import Editor, { EditorProps } from "@monaco-editor/react";
import { compile } from "../src";
import React, { Fragment, useState } from "react";
import SplitPane from "react-split-pane";
import "./style.css";
import lib from "../lib!raw";

export function App() {
  const [compiled, setCompiled] = useState("");
  const [value, setValue] = useState("");

  const onMount: EditorProps["onMount"] = (_, m) => {
    const defaults = m.languages.typescript.javascriptDefaults;
    defaults.setCompilerOptions({
      noLib: true,
      allowNonTsExtensions: true,
    });
    for (const [name, content] of lib) {
      defaults.addExtraLib(content, name);
    }
  };

  return (
    <Fragment>
      <SplitPane split="horizontal" defaultSize="50%">
        <Editor
          onValidate={() => {
            try {
              setCompiled(compile(value));
            } catch (err) {
              setCompiled(err.message);
            }
          }}
          onChange={setValue}
          language="javascript"
          onMount={onMount}
        />
        <Editor value={compiled} options={{ readOnly: true }}></Editor>
      </SplitPane>
    </Fragment>
  );
}
