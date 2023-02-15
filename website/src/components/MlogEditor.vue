<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import Editor, { useMonaco, loader } from "@guolao/vue-monaco-editor";
// resolved by vite, check the config.ts file
import { Splitpanes, Pane } from "splitpanes";
import type { CompilerOptions } from "mlogjs";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "splitpanes/dist/splitpanes.css";
import { useCompiler } from "../composables/useCompiler";
import { useSourceMapping } from "../composables/useSourceMapping";
import type { Monaco } from "../util";
import { registerMlogLang } from "../mlog/lang";
import lib from "mlogjs/lib!raw";
import { useData } from "vitepress";
import { useMediaQuery } from "../composables/useMediaQuery";

const { isDark } = useData();

const theme = computed(() => (isDark.value ? "vs-dark" : "vs"));

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.35.0/min/vs",
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

const optionsRef = shallowRef<CompilerOptions>({
  compactNames: false,
  sourcemap: true,
});

const code = ref(localStorage.getItem("code") ?? "");
const editorRef = shallowRef<monaco.editor.IStandaloneCodeEditor>();
const outEditorRef = shallowRef<monaco.editor.IStandaloneCodeEditor>();
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

function beforeMount(monaco: Monaco) {
  const defaults = monaco.languages.typescript.typescriptDefaults;
  defaults.setCompilerOptions({
    allowJs: true,
    allowNonTsExtensions: true,
    checkJs: true,
    noLib: true,
    noEmit: true,
    target: monaco.languages.typescript.ScriptTarget.ESNext,
  });
  for (const [name, content] of lib) {
    defaults.addExtraLib(content, name);
  }
  registerMlogLang(monaco);
}

function onMount(editor: monaco.editor.IStandaloneCodeEditor) {
  editorRef.value = editor;
}
function onOutMount(editor: monaco.editor.IStandaloneCodeEditor) {
  outEditorRef.value = editor;
}
</script>

<template>
  <div class="editor-wrapper">
    <Splitpanes
      class="default-theme"
      :horizontal="horizontal"
      style="height: var(--wrapper-height); width: 100vw"
    >
      <Pane size="70">
        <Editor
          language="typescript"
          v-model:value="code"
          :theme="theme"
          :options="editorOptions"
          @before-mount="beforeMount"
          @mount="onMount"
        ></Editor>
      </Pane>
      <Pane size="30">
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
.editor-wrapper :deep(.selection-highlighted) {
  background-color: hsla(203, 100%, 60%, 0.3);
}

.editor-wrapper :deep(.editor-widget) {
  position: fixed;
}
</style>
