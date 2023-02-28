import type * as mlogs from "mlogjs";
import type * as monaco from "monaco-editor";
import { ref, type Ref } from "vue";
export interface EditorSettings {
  mlogjs: Pick<mlogs.CompilerOptions, "compactNames">;
  typescript: Required<
    Pick<
      monaco.languages.typescript.CompilerOptions,
      | "noImplicitAny"
      | "noUnusedLocals"
      | "noUnusedParameters"
      | "strict"
      | "strictNullChecks"
    >
  >;
  editor: {
    confirmFileDeletion: boolean;
  };
}

export type EditorSettingsRef = Ref<EditorSettings>;

const storageKey = "editor-settings";

export function useEditorSettings(): EditorSettingsRef {
  return ref(getSettings());
}

export function saveEditorSettings(settings: EditorSettings) {
  localStorage.setItem(storageKey, JSON.stringify(settings));
}

function getSettings(): EditorSettings {
  const string = localStorage.getItem(storageKey);
  const defaultSettings = getDefaultSettings();

  if (string) {
    const data = JSON.parse(string);
    // ensures that default settings added in the future
    // can be introduced without removing the
    // already saved settings
    Object.assign(defaultSettings.editor, data.editor);
    Object.assign(defaultSettings.mlogjs, data.mlogjs);
    Object.assign(defaultSettings.typescript, data.typescript);
  }

  // default settings
  return defaultSettings;
}

function getDefaultSettings(): EditorSettings {
  return {
    editor: {
      confirmFileDeletion: true,
    },
    mlogjs: {
      compactNames: false,
    },
    typescript: {
      noUnusedLocals: true,
      noUnusedParameters: true,
      noImplicitAny: false,
      strict: false,
      strictNullChecks: false,
    },
  };
}
