import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import { useEffect } from "react";
import { SourceLocation } from "../compiler/types";

type Sourcemaps = SourceLocation[];

interface Params {
  editor: editor.IStandaloneCodeEditor | null;
  outEditor: editor.IStandaloneCodeEditor | null;
  sourcemaps: Sourcemaps | undefined;
}

const inlineClassName = "selection-highlighted";

export function useSourceMapping({ editor, outEditor, sourcemaps }: Params) {
  useEffect(() => {
    if (!(editor && outEditor)) return;

    let inputDecorations: string[] = [];
    let outputDecorations: string[] = [];

    const inputListener = outEditor.onDidChangeCursorSelection(e => {
      outputDecorations = outEditor.deltaDecorations(outputDecorations, []);
      if (!sourcemaps) return;

      const [firstSelection, decorations] = getInputDecorations(e, sourcemaps);
      inputDecorations = editor.deltaDecorations(inputDecorations, decorations);

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

      const [revealedLine, decorations] = getOutputDecorations(e, sourcemaps);

      outputDecorations = outEditor.deltaDecorations(
        outputDecorations,
        decorations
      );
      if (
        revealedLine &&
        e.reason === monaco.editor.CursorChangeReason.Explicit
      ) {
        outEditor.revealLineInCenter(revealedLine);
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

function getInputDecorations(
  e: editor.ICursorSelectionChangedEvent,
  sourcemaps: Sourcemaps
): [SourceLocation | undefined, editor.IModelDeltaDecoration[]] {
  const { startLineNumber, endLineNumber } = e.selection;
  const decorations: editor.IModelDeltaDecoration[] = [];
  const firstSelection = sourcemaps[startLineNumber - 1];

  for (let i = startLineNumber - 1; i <= endLineNumber - 1; i++) {
    const source = sourcemaps[i];
    if (!source) continue;
    decorations.push({
      options: {
        inlineClassName,
      },
      range: new monaco.Range(
        source.start.line,
        source.start.column + 1,
        source.end.line,
        source.end.column + 1
      ),
    });
  }

  return [firstSelection, decorations];
}

function getOutputDecorations(
  e: editor.ICursorSelectionChangedEvent,
  sourcemaps: Sourcemaps
): [number, editor.IModelDeltaDecoration[]] {
  const { startLineNumber, startColumn, endLineNumber, endColumn } =
    e.selection;

  const selectionRange = new monaco.Range(
    startLineNumber,
    startColumn,
    endLineNumber,
    endColumn
  );

  const decorations: editor.IModelDeltaDecoration[] = [];

  let revealedLine: number | undefined;

  // tracks source locations that contain
  // the selected area, used if the selection
  // doesn't contain any source locations
  let outerSources: [number, SourceLocation][] = [];

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
      revealedLine ??= i + 1;
      decorations.push({
        options: {
          inlineClassName,
          isWholeLine: true,
        },
        range: new monaco.Range(i + 1, 1, i + 1, 1),
      });
    } else if (sourceRange.containsRange(selectionRange)) {
      if (outerSources.length === 0) {
        outerSources.push([i, source]);
      } else {
        const [[, outer]] = outerSources;
        const outerRange = new monaco.Range(
          outer.start.line,
          outer.start.column + 1,
          outer.end.line,
          outer.end.column + 1
        );
        if (outerRange.equalsRange(sourceRange)) {
          outerSources.push([i, source]);
        } else if (outerRange.containsRange(sourceRange)) {
          outerSources = [[i, source]];
        }
      }
    }
  }

  if (decorations.length === 0 && outerSources.length > 0) {
    revealedLine = outerSources[0][0] + 1;
    for (const [i] of outerSources) {
      decorations.push({
        options: {
          inlineClassName,
          isWholeLine: true,
        },
        range: new monaco.Range(i + 1, 1, i + 1, 1),
      });
    }
  }
  return [revealedLine, decorations];
}
