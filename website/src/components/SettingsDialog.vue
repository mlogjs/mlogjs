<script setup lang="ts">
import { inject, ref } from "vue";
import {
  saveEditorSettings,
  type EditorSettingsRef,
} from "../composables/useEditorSettings";

const dialogRef = ref<HTMLDialogElement>();
const settings = inject<EditorSettingsRef>("editor-settings")!;

defineExpose({
  openDialog,
});

function openDialog() {
  dialogRef.value?.showModal();
}
function onClose() {
  saveEditorSettings(settings.value);
}
</script>
<template>
  <dialog ref="dialogRef" modal-mode="mega">
    <form method="dialog">
      <header>
        <h2>Settings</h2>
      </header>
      <article>
        <h3>Editor</h3>
        <ul>
          <li>
            <label>
              Confirm file deletion
              <input
                type="checkbox"
                name="editor-confirm-file-deletion"
                v-model="settings.editor.confirmFileDeletion"
              />
            </label>
          </li>
        </ul>
      </article>
      <article>
        <h3>MlogJS</h3>
        <ul>
          <li>
            <label>
              Compact names
              <input
                type="checkbox"
                name="mlogjs-compact-names"
                v-model="settings.mlogjs.compactNames"
              />
            </label>
          </li>
        </ul>
      </article>
      <article>
        <h3>Typescript</h3>
        <ul>
          <li>
            <label>
              No implicit any
              <input
                type="checkbox"
                name="ts-no-implicit-any"
                v-model="settings.typescript.noImplicitAny"
              />
            </label>
          </li>
          <li>
            <label>
              No unused locals
              <input
                type="checkbox"
                name="ts-no-unused-locals"
                v-model="settings.typescript.noUnusedLocals"
              />
            </label>
          </li>
          <li>
            <label>
              No unused parameters
              <input
                type="checkbox"
                name="ts-no-unused-parameters"
                v-model="settings.typescript.noUnusedParameters"
              />
            </label>
          </li>
          <li>
            <label>
              Strict
              <input
                type="checkbox"
                name="ts-strict"
                v-model="settings.typescript.strict"
              />
            </label>
          </li>
          <li>
            <label>
              Strict null checks
              <input
                type="checkbox"
                name="ts-strict-null-checks"
                v-model="settings.typescript.strictNullChecks"
              />
            </label>
          </li>
        </ul>
      </article>
      <button class="save" type="submit" @click="onClose">Save</button>
    </form>
  </dialog>
</template>

<style scoped>
dialog {
  background-color: var(--vp-c-bg);
  border-radius: 1em;
  border-color: var(--vp-c-border);
}

h3 {
  border-bottom: 1px solid var(--vp-c-border);
  margin-bottom: 0.5em;
}

article {
  border: 2px solid var(--vp-c-border);
  border-radius: 0.5rem;
  margin: 0.5em 0;
  padding: 1em;
}

label {
  display: flex;
  justify-content: space-between;
}

button.save {
  width: 100%;
  text-align: center;
  background-color: var(--vp-c-bg-elv);
  border-radius: 0.5em;
}
</style>
