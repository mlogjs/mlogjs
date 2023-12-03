import type * as monaco from "monaco-editor";
import type { EditorSettings } from "../composables/useEditorSettings";
import { parseExtraLibs, type Monaco } from "../util";
import libs from "mlogjs/lib!raw";

export function setLibs(monaco: Monaco) {
  const files = parseExtraLibs(libs);

  monaco.languages.typescript.typescriptDefaults.setExtraLibs(files);
  monaco.languages.typescript.javascriptDefaults.setExtraLibs(files);
}

export function setMonacoTypescriptSettings(
  monaco: Monaco,
  settings: EditorSettings["typescript"],
) {
  const options: monaco.languages.typescript.CompilerOptions = {
    allowNonTsExtensions: true,
    noLib: true,
    noEmit: true,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    paths: {
      [worldModuleName]: [toEditorPath("lib/world.d.ts")],
    },
    ...settings,
  };

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions(options);
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    ...options,
    allowJs: true,
    checkJs: true,
  });
}
