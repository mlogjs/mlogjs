import { onMounted, shallowRef, type ShallowRef } from "vue";
import type { Monaco } from "../util";
import { loadMonaco } from "../monaco";

export function useMonaco(): ShallowRef<Monaco | undefined> {
  const monacoRef = shallowRef<Monaco>();

  onMounted(async () => {
    const monaco = await loadMonaco();

    monacoRef.value = monaco;
  });

  return monacoRef;
}
