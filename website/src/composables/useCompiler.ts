import type { CompilerOptions } from "mlogjs";
import type { editor } from "monaco-editor";
import { ref, shallowRef, watchEffect, type Ref, type ShallowRef } from "vue";
import { compile } from "../compiler";
import type { CompilerResult } from "../compiler/types";
import type { Monaco } from "../util";

interface Params {
  code: Ref<string>;
  editorRef: ShallowRef<editor.IStandaloneCodeEditor | undefined>;
  optionsRef: ShallowRef<CompilerOptions>;
  monacoRef: ShallowRef<Monaco | null>;
}

export function useCompiler({
  code,
  editorRef,
  optionsRef,
  monacoRef,
}: Params) {
  const compiledRef = ref("");
  const sourcemapsRef = shallowRef<CompilerResult[2]>();

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  watchEffect(async onCleanup => {
    let subscribed = true;
    onCleanup(() => (subscribed = false));
    const editor = editorRef.value;
    if (!editor) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const monaco = monacoRef.value!;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const model = editor.getModel()!;

    const [output, error, sourcemaps] = await compile(
      code.value,
      optionsRef.value,
    );

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
      compiledRef.value = content;
      sourcemapsRef.value = sourcemaps;
      monaco.editor.setModelMarkers(model, "mlogjs", markers);
    }
  });

  return [compiledRef, sourcemapsRef] as const;
}
