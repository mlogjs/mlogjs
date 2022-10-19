<script setup lang="ts">
import { ref } from "vue";
import Editor from "@guolao/vue-monaco-editor";
import { useRoute } from "vitepress";
const value = ref("stuff");
console.log("mlog editor runs");
const route = useRoute();
console.log(route.path);
console.log(/editor(.html)?$/.test(route.path));
</script>

<template>
  <div class="editor-wrapper">
    <Editor
      language="javascript"
      v-model:value="value"
      height="var(--editor-height)"
      theme="vs-dark"
      class="monaco-editor"
    ></Editor>
    <Editor
      language="mlog"
      class="output"
      theme="vs-dark"
      height="var(--editor-height)"
    >
    </Editor>
  </div>
</template>

<style scoped>
.editor-wrapper {
  --editor-height: calc(100vh - var(--vp-nav-height-desktop));
  height: var(--editor-height);
  display: grid;
  grid-template-areas: "editor output";
  grid-template-columns: 3fr 1fr;
}
.editor-wrapper :deep(.monaco-editor) {
  grid-area: editor;
}
.editor-wrapper :deep(.output) {
  grid-area: output;
}
</style>
