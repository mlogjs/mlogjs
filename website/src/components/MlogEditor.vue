<script setup lang="ts">
import { computed, provide, ref, shallowRef, watch } from "vue";
import Editor, { useMonaco, loader } from "@guolao/vue-monaco-editor";
// resolved by vite, check the config.ts file
import { Splitpanes, Pane } from "splitpanes";
import type { CompilerOptions } from "mlogjs";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "splitpanes/dist/splitpanes.css";
import { useCompiler } from "../composables/useCompiler";
import { useSourceMapping } from "../composables/useSourceMapping";
import { parseExtraLibs, type Monaco } from "../util";
import { configureMlogLang, registerMlogLang } from "../mlog/lang";
import lib from "mlogjs/lib!raw";
import { useData } from "vitepress";
import { useMediaQuery } from "../composables/useMediaQuery";
import SideBar from "./SideBar.vue";
import { usePaneSizes } from "../composables/usePaneSizes";
import {
  useFileSaver,
  usePersistentFiles,
} from "../composables/usePersistentFiles";
import { useEditorSettings } from "../composables/useEditorSettings";

const { isDark } = useData();

const theme = computed(() => (isDark.value ? "vs-dark" : "vs"));

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.40.0/min/vs",
  },
});

type EditorOptions = monaco.editor.IStandaloneEditorConstructionOptions;

const editorOptions: EditorOptions = {
  fixedOverflowWidgets: true,
};
const outEditorOptions: EditorOptions = {
  readOnly: true,
  lineNumbers: n => `${n - 1}`,
};

const settings = useEditorSettings();
provide("editor-settings", settings);

const optionsRef = computed<CompilerOptions>(() => ({
  ...settings.value.mlogjs,
  sourcemap: true,
}));
const typescriptSettingsRef = computed(() => ({
  ...settings.value.typescript,
}));

const [sizes, handlePaneResize] = usePaneSizes();
const code = ref("");

const editorRef = shallowRef<monaco.editor.IStandaloneCodeEditor>();
const outEditorRef = shallowRef<monaco.editor.IStandaloneCodeEditor>();
const persistentFiles = usePersistentFiles(editorRef, outEditorRef);
provide("virtual-fs", persistentFiles);
const { currentFile } = persistentFiles;
useFileSaver(currentFile, code);

const { monacoRef } = useMonaco();
const [compiledRef, sourcemapsRef] = useCompiler({
  code,
  editorRef,
  monacoRef,
  optionsRef,
});
useSourceMapping({
  editorRef,
  outEditorRef,
  sourcemapsRef,
  monacoRef,
});
const horizontal = useMediaQuery("(max-width: 800px)");

watch([currentFile, typescriptSettingsRef], ([file, typescript]) => {
  if (!monacoRef.value || !file) return;
  const defaults = monacoRef.value.languages.typescript.typescriptDefaults;
  const options = defaults.getCompilerOptions();
  const isJs = file.name.endsWith(".js");
  defaults.setCompilerOptions({
    ...options,
    ...typescript,
    allowJs: isJs,
  });
});

function beforeMount(monaco: Monaco) {
  const defaults = monaco.languages.typescript.typescriptDefaults;
  defaults.setCompilerOptions({
    allowNonTsExtensions: true,
    checkJs: true,
    noLib: true,
    noEmit: true,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    ...typescriptSettingsRef.value,
  });
  defaults.setExtraLibs(parseExtraLibs(lib));
  registerMlogLang(monaco);
}

function onMount(editor: monaco.editor.IStandaloneCodeEditor) {
  editorRef.value = editor;
}
function onOutMount(editor: monaco.editor.IStandaloneCodeEditor) {
  outEditorRef.value = editor;
  configureMlogLang(monacoRef.value!, editor);
}

function copyToClipboard() {
  const text = compiledRef.value;
  if ("clipboard" in navigator) {
    navigator.clipboard.writeText(text);
    return;
  }
  const textArea = document.createElement("textarea");
  textArea.style.display = "none";
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}
</script>

<template>
  <div class="editor-wrapper">
    <Splitpanes
      class="default-theme"
      :horizontal="horizontal"
      :push-other-panes="false"
      style="height: var(--wrapper-height); width: 100vw"
      @resized="handlePaneResize"
    >
      <Pane :size="sizes[0]">
        <SideBar :copy-to-clipboard="copyToClipboard" />
      </Pane>
      <Pane :size="sizes[1]">
        <Editor
          language="typescript"
          v-model:value="code"
          :theme="theme"
          :options="editorOptions"
          @before-mount="beforeMount"
          @mount="onMount"
        ></Editor>
      </Pane>
      <Pane :size="sizes[2]">
        <Editor
          language="mlog"
          :theme="theme"
          :value="compiledRef"
          :options="outEditorOptions"
          @mount="onOutMount"
        >
        </Editor>
      </Pane>
    </Splitpanes>
  </div>
</template>

<style scoped>
.editor-wrapper {
  --wrapper-height: calc(100vh - var(--vp-nav-height));
  height: var(--wrapper-height);
  width: 100vw;
}
.editor-wrapper :deep(.splitpanes__splitter) {
  background-color: gray;
  border-color: gray;
}
.editor-wrapper :deep(.splitpanes__pane) {
  background-color: transparent;
}
.editor-wrapper :deep(.selection-highlighted) {
  background-color: hsla(203, 100%, 60%, 0.3);
}

.editor-wrapper :deep(.editor-widget) {
  position: fixed;
}
</style>
