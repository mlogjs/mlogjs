import type { editor, languages } from "monaco-editor";
import { watchEffect, type ShallowRef } from "vue";
import type { Monaco } from "../util";

interface Params {
  editorRef: ShallowRef<editor.IStandaloneCodeEditor | undefined>;
  monacoRef: ShallowRef<Monaco | undefined>;
}

/**
 * Adds a color picker for calls of `getColor` to let users easily see the
 * colors they are embedding in their scripts.
 */
export function useColorPicker({ editorRef, monacoRef }: Params) {
  watchEffect(onCleanup => {
    const monaco = monacoRef.value;
    const editor = editorRef.value;
    if (!editor || !monaco) return;

    const colorProvider: languages.DocumentColorProvider = {
      provideColorPresentations(model, colorInfo) {
        const color = colorInfo.color;
        const red = Math.round(color.red * 255);
        const green = Math.round(color.green * 255);
        const blue = Math.round(color.blue * 255);
        const alpha = Math.round(color.alpha * 255);
        const c = (color: number) => color.toString(16).padStart(2, "0");
        let label: string;
        if (alpha === 255) {
          label = `getColor("${c(red)}${c(green)}${c(blue)}")`;
        } else {
          label = `getColor("${c(red)}${c(green)}${c(blue)}${c(alpha)}")`;
        }
        return [{ label }];
      },
      provideDocumentColors(model) {
        const text = model.getValue();

        // allowing whitespace for more flexibility
        const reg = /getColor\s*\(('|")([0-9a-fA-F]{0,8})('|")\s*\)/g;
        let match;
        const result: languages.IColorInformation[] = [];
        while ((match = reg.exec(text))) {
          const color = match[2];
          const start = model.getPositionAt(match.index);
          const end = model.getPositionAt(match.index + match[0].length);
          result.push({
            color: parseColor(color),
            range: {
              startLineNumber: start.lineNumber,
              startColumn: start.column,
              endLineNumber: end.lineNumber,
              endColumn: end.column,
            },
          });
        }
        return result;
      },
    };

    const tsDisposable = monaco.languages.registerColorProvider(
      "typescript",
      colorProvider,
    );
    const jsDisposable = monaco.languages.registerColorProvider(
      "javascript",
      colorProvider,
    );

    onCleanup(() => {
      tsDisposable.dispose();
      jsDisposable.dispose();
    });
  });
}

function parseColor(color: string) {
  if (color.length !== 6 && color.length !== 8)
    return { red: 0, green: 0, blue: 0, alpha: 1 };

  const red = parseInt(color.slice(0, 2), 16) / 255;
  const green = parseInt(color.slice(2, 4), 16) / 255;
  const blue = parseInt(color.slice(4, 6), 16) / 255;
  const alpha = color.length === 8 ? parseInt(color.slice(6, 8), 16) / 255 : 1;
  return { red, green, blue, alpha };
}
