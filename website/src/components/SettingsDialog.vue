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
      <fieldset>
        <legend>Editor</legend>
        <label>
          Confirm file deletion
          <input
            type="checkbox"
            name="editor-confirm-file-deletion"
            v-model="settings.editor.confirmFileDeletion"
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>MlogJS</legend>
        <label>
          Compact names
          <input
            type="checkbox"
            name="mlogjs-compact-names"
            v-model="settings.mlogjs.compactNames"
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Typescript</legend>
        <label>
          No implicit any
          <input
            type="checkbox"
            name="ts-no-implicit-any"
            v-model="settings.typescript.noImplicitAny"
          />
        </label>
        <label>
          No unused locals
          <input
            type="checkbox"
            name="ts-no-unused-locals"
            v-model="settings.typescript.noUnusedLocals"
          />
        </label>
        <label>
          No unused parameters
          <input
            type="checkbox"
            name="ts-no-unused-parameters"
            v-model="settings.typescript.noUnusedParameters"
          />
        </label>
        <label>
          Strict
          <input
            type="checkbox"
            name="ts-strict"
            v-model="settings.typescript.strict"
          />
        </label>
        <label>
          Strict null checks
          <input
            type="checkbox"
            name="ts-strict-null-checks"
            v-model="settings.typescript.strictNullChecks"
          />
        </label>
      </fieldset>
      <fieldset>
        <legend>Mlog Watcher Integration</legend>
        <label>
          Enabled
          <input type="checkbox" v-model="settings.mlogWatcher.enabled" />
        </label>
        <label>
          Auto Send
          <input
            type="checkbox"
            name="mlog-watcher-auto-send"
            v-model="settings.mlogWatcher.autoSend"
          />
        </label>
        <label>
          Server port
          <input
            type="number"
            name="mlog-watcher-server-port"
            v-model.lazy="settings.mlogWatcher.serverPort"
          />
        </label>
      </fieldset>
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

fieldset {
  border: 2px solid var(--vp-c-border);
  border-radius: 0.5rem;
  margin: 0.5em 0;
  padding: 1em;
  padding-top: 0.5em;
}

label {
  display: flex;
  justify-content: space-between;
}

input {
  font-family: var(--vp-font-family-base);
  text-align: right;
}

input[name="mlog-watcher-server-port"] {
  width: 4em;
  border-bottom: 2px solid var(--vp-c-border);
}

button.save {
  width: 100%;
  text-align: center;
  background-color: var(--vp-c-bg-elv);
  border-radius: 0.5em;
}
</style>
