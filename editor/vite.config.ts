import react from "@vitejs/plugin-react";
import { defineConfig, PluginOption } from "vite";
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

const rawResolver: PluginOption = {
  name: "raw-resolver",
  resolveId: (id, from) => {
    if (!id.endsWith("!raw")) return null;
    const base = id.startsWith(".")
      ? dirname(from)
      : resolve(__dirname, "../node_modules");
    return "\0raw" + resolve(base, id.slice(0, -4));
  },
  load: async id =>
    id.startsWith("\0raw")
      ? "export default " + JSON.stringify(await raw(id.slice(4)))
      : null,
};

export default defineConfig({
  build: {
    outDir: resolve(__dirname, "../docs/editor"),
    emptyOutDir: true,
  },
  base: "mlogjs/editor",
  plugins: [react(), rawResolver],
});
