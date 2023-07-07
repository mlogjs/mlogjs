export type Monaco = typeof import("monaco-editor");

export const editorFSPrefix = "editor-fs";

export function debounce<Args extends unknown[]>(
  run: (...args: Args) => void,
  delay: number
) {
  let timeout: number;

  return (...args: Args) => {
    if (timeout != undefined) clearTimeout(timeout);
    timeout = setTimeout(() => run(...args), delay, []);
  };
}

export function parseExtraLibs(lib: [string, string][]) {
  const libs = lib.map(([name, content]) => ({
    content,
    filePath: `${editorFSPrefix}://${name.split("/compiler/")[1]}`,
  }));
  return libs;
}
