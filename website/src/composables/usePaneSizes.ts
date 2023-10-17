import { ref, type Ref } from "vue";

export type PaneResizeEvent = { min: number; max: number; size: number }[];

export interface PaneSizes {
  sideBar: number;
  codeEditor: number;
  outputEditor: number;
}

const desktopStorageKey = "desktop-editor-splits";
const mobileStorageKey = "mobile-editor-splits";

export function usePaneSizes(isMobile: Ref<boolean>) {
  const sizes = ref(getSavedSizes(isMobile.value));

  function handlePaneResize(event: PaneResizeEvent) {
    sizes.value = arrayToPaneSizes(
      event.map(item => item.size),
      isMobile.value,
    );
    savePaneSizes(sizes.value, isMobile.value);
  }

  return [sizes, handlePaneResize] as const;
}

function arrayToPaneSizes(array: number[], isMobile: boolean): PaneSizes {
  if (isMobile) {
    return {
      sideBar: 0,
      codeEditor: array[0],
      outputEditor: array[1],
    };
  }
  return {
    sideBar: array[0],
    codeEditor: array[1],
    outputEditor: array[2],
  };
}

function paneSizesToArray(sizes: PaneSizes, isMobile: boolean) {
  if (isMobile) return [sizes.codeEditor, sizes.outputEditor];
  return [sizes.sideBar, sizes.codeEditor, sizes.outputEditor];
}

function getSavedSizes(isMobile: boolean): PaneSizes {
  const key = isMobile ? mobileStorageKey : desktopStorageKey;
  const string = localStorage.getItem(key);
  const defaultValue = isMobile ? [50, 50] : [15, 55, 30];
  if (string) {
    const value = JSON.parse(string) as number[];

    // ensures that the the saved config is compatible
    // with the amount of existing panes
    if (value.length === defaultValue.length)
      return arrayToPaneSizes(value, isMobile);
  }
  return arrayToPaneSizes(defaultValue, isMobile);
}

function savePaneSizes(sizes: PaneSizes, isMobile: boolean) {
  const key = isMobile ? mobileStorageKey : desktopStorageKey;
  const array = paneSizesToArray(sizes, isMobile);
  localStorage.setItem(key, JSON.stringify(array));
}
