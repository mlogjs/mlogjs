<script setup lang="ts">
import { inject } from "vue";
import type { EditorSettingsRef } from "../composables/useEditorSettings";
import type {
  PersistentFile,
  usePersistentFiles,
} from "../composables/usePersistentFiles";
import EditIcon from "../icons/EditIcon.vue";
import TrashIcon from "../icons/TrashIcon.vue";

const { currentFile, files, changeCurrentFile, removeFile, renameFile } =
  inject<ReturnType<typeof usePersistentFiles>>("virtual-fs")!;
const settings = inject<EditorSettingsRef>("editor-settings")!;

async function deleteFile(file: PersistentFile) {
  if (files.value.length == 1) {
    alert("There must be at least one file");
    return;
  }
  if (settings.value.editor.confirmFileDeletion) {
    const result = confirm("Are you sure yout want to delete this file?");
    if (!result) return;
  }

  await removeFile(file);
}
async function rename(file: PersistentFile) {
  const input = prompt(
    "Enter the name of the file. Put an extension (.js or .ts) to specify the language."
  );
  if (!input) return;

  const extensionRegex = /\.[^.]+$/;
  const name = extensionRegex.test(input) ? input : `${input}.ts`;

  if (files.value.find(file => file.name == name)) {
    alert("A file with this name already exists.");
    return;
  }

  await renameFile(file, name);
}
</script>

<template>
  <ul>
    <li v-for="file in files" :key="file.name">
      <button
        class="file"
        :class="{ active: file === currentFile }"
        @click="() => changeCurrentFile(file)"
      >
        <span>
          {{ file.name }}
        </span>
        <div class="file-actions">
          <button @click.stop="() => rename(file)" title="Change the file name">
            <EditIcon />
          </button>
          <button @click.stop="() => deleteFile(file)" title="Delete the file">
            <TrashIcon />
          </button>
        </div>
      </button>
    </li>
  </ul>
</template>

<style scoped>
ul {
  box-sizing: border-box;
  height: calc(var(--wrapper-height) - 1.5em);
  overflow-y: auto;
  overflow-x: hidden;
}

button.file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 1.5em;
}

button.file.active {
  background-color: var(--vp-c-divider);
}

.file span {
  text-align: start;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

div.file-actions {
  position: relative;
  display: flex;
  flex-direction: row;
  gap: 1em;
}

@media screen and (max-width: 800px) {
  ul {
    height: 100%;
    overflow: hidden;
  }
}
</style>
