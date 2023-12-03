<script setup lang="ts">
import { computed, provide, ref, shallowRef, watchEffect } from "vue";
import { Splitpanes, Pane } from "splitpanes";
import type { CompilerOptions } from "mlogjs";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "splitpanes/dist/splitpanes.css";
import { useCompiler } from "../composables/useCompiler";
import { useSourceMapping } from "../composables/useSourceMapping";
import { useData } from "vitepress";
import { useMediaQuery } from "../composables/useMediaQuery";
import SideBar from "./SideBar.vue";
import { usePaneSizes } from "../composables/usePaneSizes";
import {
  useFileSaver,
  usePersistentFiles,
} from "../composables/usePersistentFiles";
import { useEditorSettings } from "../composables/useEditorSettings";
import { useMonaco } from "../composables/useMonaco";
import {
  addWorldModuleSnippet,
  configureMlogLang,
  setMonacoTypescriptSettings,
} from "../monaco";
import MonacoEditor, {
  provideMonaco,
  useMonacoTheme,
} from "@jeanjpnm/monaco-vue";
import "@jeanjpnm/monaco-vue/style.css";
const { isDark } = useData();

const theme = computed(() => (isDark.value ? "vs-dark" : "vs"));

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

const isMobile = useMediaQuery("(max-width: 800px)");
const [sizes, handlePaneResize] = usePaneSizes(isMobile);
const code = ref("");

const editorRef = shallowRef<monaco.editor.IStandaloneCodeEditor>();
const outEditorRef = shallowRef<monaco.editor.IStandaloneCodeEditor>();
const persistentFiles = usePersistentFiles(editorRef, outEditorRef);
provide("virtual-fs", persistentFiles);
const { currentFile } = persistentFiles;
useFileSaver(currentFile, code);

const monacoRef = useMonaco();
provideMonaco({ monacoRef });
useMonacoTheme(monacoRef, theme);

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

const language = computed(() => {
  const file = currentFile.value;
  if (file?.name.endsWith(".js")) return "javascript";
  return "typescript";
});

watchEffect(() => {
  const monaco = monacoRef.value;
  if (!monaco) return;
  setMonacoTypescriptSettings(monaco, settings.value.typescript);
});

watchEffect(onCleanup => {
  const monaco = monacoRef.value;
  if (!monaco) return;

  const disposable = addWorldModuleSnippet(monaco);
  onCleanup(() => disposable.dispose());
});

function onReady(editor: monaco.editor.IStandaloneCodeEditor) {
  editorRef.value = editor;
}

function onOutReady(editor: monaco.editor.IStandaloneCodeEditor) {
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
    <SideBar v-if="isMobile" :copy-to-clipboard="copyToClipboard" />
    <Splitpanes
      class="default-theme"
      :horizontal="isMobile"
      :push-other-panes="false"
      style="flex: 1; width: 100vw"
      @resized="handlePaneResize"
    >
      <Pane v-if="!isMobile" :size="sizes.sideBar">
        <SideBar :copy-to-clipboard="copyToClipboard" />
      </Pane>
      <Pane :size="sizes.codeEditor">
        <MonacoEditor
          :language="language"
          v-model:value="code"
          :options="editorOptions"
          @ready="onReady"
        ></MonacoEditor>
      </Pane>
      <Pane :size="sizes.outputEditor">
        <MonacoEditor
          language="mlog"
          :value="compiledRef"
          :options="outEditorOptions"
          @ready="onOutReady"
        >
        </MonacoEditor>
      </Pane>
    </Splitpanes>
  </div>
</template>

<style scoped>
.editor-wrapper {
  --wrapper-height: calc(100vh - var(--vp-nav-height));
  height: var(--wrapper-height);
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
