export type PaneResizeEvent = { min: number; max: number; size: number }[];

const storageKey = "editor-splits";

export function usePaneSizes() {
  const sizes = getSavedSizes();

  function handlePaneResize(event: PaneResizeEvent) {
    for (let i = 0; i < event.length; i++) {
      sizes[i] = event[i].size;
    }
    localStorage.setItem(storageKey, JSON.stringify(sizes));
  }

  return [sizes, handlePaneResize] as const;
}

function getSavedSizes(): number[] {
  const string = localStorage.getItem(storageKey);
  if (string) {
    const value = JSON.parse(string) as number[];

    // ensures that the the saved config is compatible
    // with the amount of existing panes
    if (value.length == 2) return value;
  }
  return [70, 30];
}
