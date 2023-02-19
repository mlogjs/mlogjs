import type { editor } from "monaco-editor";
import type { SourceLocation } from "../compiler/types";
import { watchEffect, type ShallowRef } from "vue";
import type { Monaco } from "../util";
import type * as monaco from "monaco-editor";

type Sourcemaps = SourceLocation[];

interface Params {
  editorRef: ShallowRef<editor.IStandaloneCodeEditor | undefined>;
  outEditorRef: ShallowRef<editor.IStandaloneCodeEditor | undefined>;
  sourcemapsRef: ShallowRef<Sourcemaps | undefined>;
  monacoRef: ShallowRef<Monaco | null>;
}

const className = "selection-highlighted";

export function useSourceMapping({
  editorRef,
  outEditorRef,
  sourcemapsRef,
  monacoRef,
}: Params) {
  watchEffect(onCleanup => {
    const monaco = monacoRef.value;
    const editor = editorRef.value;
    const outEditor = outEditorRef.value;
    const sourcemaps = sourcemapsRef.value;
    if (!editor || !outEditor || !monaco) return;

    const inputCollection = editor.createDecorationsCollection();
    const outputCollection = outEditor.createDecorationsCollection();

    const inputListener = outEditor.onDidChangeCursorSelection(e => {
      outputCollection.clear();
      clearEditorSelection(monaco, editor);

      if (
        !sourcemaps ||
        e.reason === monaco.editor.CursorChangeReason.ContentFlush
      )
        return;

      const [firstSelection, decorations] = getInputDecorations(
        monaco,
        e,
        sourcemaps
      );
      inputCollection.set(decorations);

      if (firstSelection) {
        editor.revealLineInCenter(firstSelection.start.line);
      }
    });

    const outputListener = editor.onDidChangeCursorSelection(e => {
      inputCollection.clear();
      clearEditorSelection(monaco, outEditor);

      if (
        !sourcemaps ||
        e.reason === monaco.editor.CursorChangeReason.ContentFlush
      )
        return;

      const [revealedLine, decorations] = getOutputDecorations(
        monaco,
        e,
        sourcemaps
      );

      outputCollection.set(decorations);
      if (revealedLine) {
        outEditor.revealLineInCenter(revealedLine);
      }
    });
    onCleanup(() => {
      inputListener.dispose();
      outputListener.dispose();
      inputCollection.clear();
      outputCollection.clear();
    });
  });
}

function getInputDecorations(
  monaco: Monaco,
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
        className,
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
  monaco: Monaco,
  e: editor.ICursorSelectionChangedEvent,
  sourcemaps: Sourcemaps
): [number | undefined, editor.IModelDeltaDecoration[]] {
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
          className,
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
          className,
          isWholeLine: true,
        },
        range: new monaco.Range(i + 1, 1, i + 1, 1),
      });
    }
  }
  return [revealedLine, decorations];
}

function clearEditorSelection(
  monaco: Monaco,
  editor: monaco.editor.IStandaloneCodeEditor
) {
  const position = editor.getPosition();
  if (!position) return;
  editor.setSelection(monaco.Range.fromPositions(position));
}
