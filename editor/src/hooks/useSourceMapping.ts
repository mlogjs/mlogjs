import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import { useEffect } from "react";
import { CompilerResult } from "../compiler/types";

type Sourcemaps = CompilerResult[2];
type SourceLocation = Sourcemaps[number];

interface Params {
  editor: editor.IStandaloneCodeEditor | null;
  outEditor: editor.IStandaloneCodeEditor | null;
  sourcemaps: Sourcemaps | undefined;
}

export function useSourceMapping({ editor, outEditor, sourcemaps }: Params) {
  useEffect(() => {
    if (!(editor && outEditor)) return;

    let inputDecorations: string[] = [];
    let outputDecorations: string[] = [];

    const inputListener = outEditor.onDidChangeCursorSelection(e => {
      outputDecorations = outEditor.deltaDecorations(outputDecorations, []);
      if (!sourcemaps) return;
      const newDecorations: editor.IModelDeltaDecoration[] = [];
      const { startLineNumber, endLineNumber } = e.selection;

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
        editor.revealLineInCenter(firstSelection.start.line);
      }
    });

    const outputListener = editor.onDidChangeCursorSelection(e => {
      inputDecorations = editor.deltaDecorations(inputDecorations, []);
      if (!sourcemaps) return;
      const { startLineNumber, startColumn, endLineNumber, endColumn } =
        e.selection;

      const selectionRange = new monaco.Range(
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn
      );
      const newDecorations: editor.IModelDeltaDecoration[] = [];

      let decorationStart: number;
      let outers: [number, SourceLocation][] = [];

      for (let i = 0; i < sourcemaps.length; i++) {
        const source = sourcemaps[i];
        if (!source) continue;
        const sourceRange = new monaco.Range(
          source.start.line,
          source.start.column + 1,
          source.end.line,
          source.end.column + 1
        );
        if (selectionRange.containsRange(sourceRange)) {
          decorationStart ??= i + 1;
          newDecorations.push({
            options: {
              inlineClassName: "selection-highlighted",
              isWholeLine: true,
            },
            range: new monaco.Range(i + 1, 1, i + 1, 1),
          });
        } else if (sourceRange.containsRange(selectionRange)) {
          if (outers.length === 0) {
            outers.push([i, source]);
          } else {
            const [[, outer]] = outers;
            const outerRange = new monaco.Range(
              outer.start.line,
              outer.start.column + 1,
              outer.end.line,
              outer.end.column + 1
            );
            if (outerRange.equalsRange(sourceRange)) {
              outers.push([i, source]);
            } else if (outerRange.containsRange(sourceRange)) {
              outers = [[i, source]];
            }
          }
        }
      }

      if (outers.length > 0 && newDecorations.length === 0) {
        decorationStart = outers[0]?.[0];
        for (const [i] of outers) {
          newDecorations.push({
            options: {
              inlineClassName: "selection-highlighted",
              isWholeLine: true,
            },
            range: new monaco.Range(i + 1, 1, i + 1, 1),
          });
        }
      }

      outputDecorations = outEditor.deltaDecorations(
        outputDecorations,
        newDecorations
      );
      if (
        decorationStart &&
        e.reason === monaco.editor.CursorChangeReason.Explicit
      ) {
        outEditor.revealLineInCenter(decorationStart);
      }
    });
    return () => {
      inputListener.dispose();
      outputListener.dispose();
      editor.deltaDecorations(inputDecorations, []);
      outEditor.deltaDecorations(outputDecorations, []);
    };
  }, [editor, outEditor, sourcemaps]);
}
