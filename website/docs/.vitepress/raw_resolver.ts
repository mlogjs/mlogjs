import type { PluginOption } from "vite";
import { readdir, stat, readFile } from "fs/promises";
import { resolve, relative, dirname } from "path";

type File = [string, string];

const raw = async (path: string, root = path): Promise<File[]> =>
  (await stat(path)).isDirectory()
    ? (
        await Promise.all(
          (await readdir(path)).map(name => raw(resolve(path, name), root))
        )
      ).flat()
    : [[relative(root, path), await readFile(path, "utf8")]];

export function rawResolver(): PluginOption {
  return {
    name: "raw-resolver",
    resolveId(id, from) {
      if (!id.endsWith("!raw")) return null;
      const base = id.startsWith(".")
        ? dirname(from!)
        : resolve(__dirname, "../../node_modules");
      return "\0raw" + resolve(base, id.slice(0, -4));
    },
    async load(id) {
      if (!id.startsWith("\0raw")) return null;
      return "export default " + JSON.stringify(await raw(id.slice(4)));
    },
  };
}
