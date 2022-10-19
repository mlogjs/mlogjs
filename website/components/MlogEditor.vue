<script setup lang="ts">
import { ref } from "vue";
import Editor from "@guolao/vue-monaco-editor";
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
const value = ref("stuff");
</script>

<template>
  <div class="editor-wrapper">
    <Splitpanes class="default-theme">
      <Pane size="70">
        <Editor
          language="javascript"
          v-model:value="value"
          height="var(--editor-height)"
          theme="vs-dark"
          class="monaco-editor"
        ></Editor>
      </Pane>
      <Pane size="30">
        <Editor
          language="mlog"
          class="output"
          theme="vs-dark"
          height="var(--editor-height)"
        >
        </Editor>
      </Pane>
    </Splitpanes>
  </div>
</template>

<style scoped>
.editor-wrapper {
  --editor-height: calc(100vh - var(--vp-nav-height-desktop));
  height: var(--editor-height);
  display: grid;
}
.editor-wrapper :deep(.monaco-editor) {
  grid-area: editor;
}
.editor-wrapper :deep(.output) {
  grid-area: output;
}
.editor-wrapper :deep(.splitpanes__splitter) {
  background-color: gray;
  border-color: gray;
}
</style>
