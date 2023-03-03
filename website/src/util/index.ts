export type Monaco = typeof import("monaco-editor");

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
