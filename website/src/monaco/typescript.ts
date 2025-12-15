import type * as monaco from "monaco-editor";
import type { EditorSettings } from "../composables/useEditorSettings";
import { parseExtraLibs, type Monaco, toEditorPath } from "../util";
import libs from "mlogjs/lib!raw";

const worldModuleName = "mlogjs:world";

export function setLibs(monaco: Monaco) {
  const files = parseExtraLibs(libs);

  monaco.typescript.typescriptDefaults.setExtraLibs(files);
  monaco.typescript.javascriptDefaults.setExtraLibs(files);
}

export function addWorldModuleSnippet(monaco: Monaco) {
  return monaco.languages.registerCompletionItemProvider(
    ["typescript", "javascript"],
    {
      provideCompletionItems(model, position) {
        const lineLength = model.getLineLength(position.lineNumber);
        return {
          suggestions: [
            {
              label: `Add import from "${worldModuleName}"`,
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: `import {  } from "${worldModuleName}";`,
              range: new monaco.Range(
                position.lineNumber,
                0,
                position.lineNumber,
                lineLength,
              ),
            },
          ],
        };
      },
    },
  );
}

export function setMonacoTypescriptSettings(
  monaco: Monaco,
  settings: EditorSettings["typescript"],
) {
  const options: monaco.typescript.CompilerOptions = {
    allowNonTsExtensions: true,
    noLib: true,
    noEmit: true,
    target: monaco.typescript.ScriptTarget.ESNext,
    paths: {
      [worldModuleName]: [toEditorPath("lib/world.d.ts")],
    },
    ...settings,
  };

  monaco.typescript.typescriptDefaults.setCompilerOptions(options);
  monaco.typescript.javascriptDefaults.setCompilerOptions({
    ...options,
    allowJs: true,
    checkJs: true,
  });
}
