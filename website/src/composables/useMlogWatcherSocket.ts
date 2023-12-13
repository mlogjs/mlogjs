import { onMounted, onUnmounted, watchEffect, type Ref, ref } from "vue";

export function useMlogWatcherSocket(port: number, code: Ref<string>) {
  const socket = ref<WebSocket>();
  const ready = ref(false);

  const send = debounce(700, (code: string) => {
    socket.value?.send(code);
  });

  onMounted(() => {
    const websocket = new WebSocket(`ws://localhost:${port}`);
    socket.value = websocket;
    websocket.onopen = () => {
      console.log("opened");
      ready.value = true;
    };
    websocket.onerror = event => {
      console.log(event);
    };
  });

  onUnmounted(() => {
    socket.value?.close();
  });

  watchEffect(() => {
    console.log("changed");
    if (ready.value) send(code.value);
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
