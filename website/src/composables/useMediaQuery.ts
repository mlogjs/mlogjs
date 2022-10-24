import { onMounted, onUnmounted, ref, type Ref } from "vue";

export function useMediaQuery(query: string) {
  const media = window.matchMedia(query);

  const matches = ref(media.matches);

  function handleChange() {
    matches.value = media.matches;
  }

  onMounted(() => media.addEventListener("change", handleChange));
  onUnmounted(() => media.removeEventListener("change", handleChange));

  return matches;
}
