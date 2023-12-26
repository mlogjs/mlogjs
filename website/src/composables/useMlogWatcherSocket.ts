import { watchEffect, type Ref, ref, computed } from "vue";
import type { EditorSettingsRef } from "./useEditorSettings";

export function useMlogWatcherSocket(
  settingsRef: EditorSettingsRef,
  code: Ref<string>,
) {
  const socket = ref<WebSocket>();
  const ready = ref(false);
  const port = computed(() => settingsRef.value.mlogWatcher.serverPort);
  const autoSend = computed(() => settingsRef.value.mlogWatcher.autoSend);

  const send = debounce(700, (code: string) => {
    socket.value?.send(code);
  });

  watchEffect(onCleanup => {
    const websocket = new WebSocket(`ws://localhost:${port.value}`);
    websocket.onopen = () => {
      ready.value = true;
    };
    socket.value = websocket;

    onCleanup(() => {
      socket.value?.close();
    });
  });

  watchEffect(() => {
    if (ready.value && autoSend.value) send(code.value);
  });
}

function debounce<Args extends unknown[]>(
  delay: number,
  fn: (...args: Args) => unknown,
) {
  let timer: number | undefined;

  return (...args: Args) => {
    clearTimeout(timer);

    timer = setTimeout(() => fn(...args), delay) as never;
  };
}
