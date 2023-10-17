<script setup lang="ts">
import { inject, ref } from "vue";
import type { usePersistentFiles } from "../composables/usePersistentFiles";
import AddIcon from "../icons/AddIcon.vue";
import ClippyIcon from "../icons/ClippyIcon.vue";
import FileCode from "../icons/FileCodeIcon.vue";
import SettingsGearIcon from "../icons/SettingsGearIcon.vue";
import SettingsDialog from "./SettingsDialog.vue";
import FileMenu from "./FileMenu.vue";
import { useMediaQuery } from "../composables/useMediaQuery";

const { copyToClipboard } = defineProps<{
  copyToClipboard: () => void;
}>();

const { files, addFile } =
  inject<ReturnType<typeof usePersistentFiles>>("virtual-fs")!;

const settingsDialogRef = ref<InstanceType<typeof SettingsDialog>>();
const fileDialogRef = ref<HTMLDialogElement>();

const isMobileLayout = useMediaQuery("(max-width: 800px)");
async function createFile() {
  const input = prompt(
    "Enter the name of the file. Put an extension (.js or .ts) to specify the language.",
  );
  if (!input) return;

  const extensionRegex = /\.[^.]+$/;
  const name = extensionRegex.test(input) ? input : `${input}.ts`;

  if (files.value.find(file => file.name == name)) {
    alert("A file with this name already exists.");
    return;
  }
  await addFile({
    name,
    content: "",
  });
}
</script>

<template>
  <div>
    <div class="bar-actions">
      <button @click="createFile" title="Create a new file">
        <AddIcon />
      </button>
      <button
        v-if="isMobileLayout"
        @click="fileDialogRef?.showModal()"
        title="Open the file menu"
      >
        <FileCode />
      </button>
      <button
        @click="settingsDialogRef?.openDialog()"
        title="Open the editor settings"
      >
        <SettingsGearIcon />
      </button>
      <button @click="copyToClipboard" title="Copy output to clipboard">
        <ClippyIcon />
      </button>
    </div>

    <FileMenu v-if="!isMobileLayout" />
    <dialog v-else ref="fileDialogRef" @click="() => fileDialogRef?.close()">
      <FileMenu />
    </dialog>
  </div>
  <SettingsDialog ref="settingsDialogRef" />
</template>

<style scoped>
div {
  --svg-icon-fill: var(--vp-c-text-1);
}

div :deep(svg) {
  width: 1.5em;
  height: 1.5em;
}
div.bar-actions {
  display: flex;
  justify-content: space-around;
  margin: 0.5em 0;
}
dialog {
  background-color: var(--vp-c-bg);
  border-radius: 1em;
  border-color: var(--vp-c-border);
}
</style>
