import { watchEffect, type Ref, ref, computed } from "vue";
import type { EditorSettingsRef } from "./useEditorSettings";

export function useMlogWatcherSocket(
  settingsRef: EditorSettingsRef,
  code: Ref<string>,
) {
  const socket = ref<WebSocket>();
  const ready = ref(false);
  const manuallyTriggered = ref(false);
  const port = computed(() => settingsRef.value.mlogWatcher.serverPort);
  const autoSend = computed(() => settingsRef.value.mlogWatcher.autoSend);
  const enabled = computed(() => settingsRef.value.mlogWatcher.enabled);

  const send = (code: string) => {
    socket.value?.send(code);
  };

  const debouncedSend = debounce(700, (code: string) => {
    socket.value?.send(code);
  });

  watchEffect(onCleanup => {
    if (!enabled.value) return;

    const websocket = new WebSocket(`ws://localhost:${port.value}`);
    websocket.onopen = () => {
      ready.value = true;
    };
    websocket.onclose = () => {
      ready.value = false;
    };
    socket.value = websocket;

    onCleanup(() => {
      socket.value?.close();
    });
  });

  watchEffect(() => {
    if (ready.value && autoSend.value) debouncedSend(code.value);
  });

  watchEffect(() => {
    if (ready.value && manuallyTriggered.value) {
      send(code.value);
      manuallyTriggered.value = false;
    }
  });

  return () => (manuallyTriggered.value = true);
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
