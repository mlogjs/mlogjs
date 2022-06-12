import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import { useEffect } from "react";
import { CompilerResult } from "../compiler/types";

interface Params {
  editor: editor.IStandaloneCodeEditor | null;
  outEditor: editor.IStandaloneCodeEditor | null;
  sourcemaps: CompilerResult[2] | undefined;
}
export function useSourceMapping({ editor, outEditor, sourcemaps }: Params) {
  useEffect(() => {
    if (!(editor && outEditor)) return;

    let inputDecorations: string[] = [];
    let outputDecorations: string[] = [];

    const listener = outEditor.onDidChangeCursorSelection(e => {
      if (!sourcemaps) return;
      const newDecorations: editor.IModelDeltaDecoration[] = [];
      const { startLineNumber, endLineNumber } = e.selection;
      console.log(startLineNumber, endLineNumber);
      for (let i = startLineNumber - 1; i <= endLineNumber - 1; i++) {
        const source = sourcemaps[i];
        if (!source) continue;
        newDecorations.push({
          options: {
            inlineClassName: "selection-highlighted",
          },
          range: new monaco.Range(
            source.start.line,
            source.start.column + 1,
            source.end.line,
            source.end.column + 1
          ),
        });
      }
      inputDecorations = editor.deltaDecorations(
        inputDecorations,
        newDecorations
      );
      const firstSelection = sourcemaps[startLineNumber - 1];
      if (
        firstSelection &&
        e.reason === monaco.editor.CursorChangeReason.Explicit
      ) {
        editor.revealLine(firstSelection.start.line);
      }
    });
    const eraserListener = editor.onDidChangeCursorSelection(e => {
      inputDecorations = editor.deltaDecorations(inputDecorations, []);
      const { startLineNumber, startColumn, endLineNumber, endColumn } =
        e.selection;
    });
    return () => {
      listener.dispose();
      eraserListener.dispose();
      editor.deltaDecorations(inputDecorations, []);
      outEditor.deltaDecorations(outputDecorations, []);
    };
  }, [editor, outEditor, sourcemaps]);
}
