import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import { useEffect, useState } from "react";
import { CompilerResult } from "../compiler/types";

interface Params {
  editor: editor.IStandaloneCodeEditor | null;
  outEditor: editor.IStandaloneCodeEditor | null;
  sourcemaps: CompilerResult[2] | undefined;
}
export function useSourceMapping({ editor, outEditor, sourcemaps }: Params) {
  useEffect(() => {
    let decorations: string[] = [];

    if (!(editor && outEditor && sourcemaps)) return;

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
      decorations = editor.deltaDecorations(decorations, newDecorations);
      const firstSelection = sourcemaps[startLineNumber - 1];
      if (firstSelection) {
        editor.revealLine(firstSelection.start.line);
      }
    });
    const eraserListener = editor.onDidChangeCursorSelection(e => {
      decorations = editor.deltaDecorations(decorations, []);
    });
    return () => {
      listener.dispose();
      eraserListener.dispose();
    };
  }, [editor, outEditor, sourcemaps]);
}
