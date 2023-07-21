export type Monaco = typeof import("monaco-editor");

export const editorFSPrefix = "editor-fs";

export function debounce<Args extends unknown[]>(
  run: (...args: Args) => void | Promise<void>,
  delay: number,
) {
  let timeout: number;

  return (...args: Args) => {
    if (timeout != undefined) clearTimeout(timeout);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    timeout = setTimeout(() => run(...args), delay, []);
  };
}

export function toEditorPath(path: string) {
  return `file:///editor/${path}`;
}

export function parseExtraLibs(lib: [string, string][]) {
  const libs = lib.map(([name, content]) => ({
    content,
    filePath: toEditorPath(name.split("/compiler/")[1]),
  }));
  console.log(libs.map(lib => lib.filePath));
  return libs;
}
