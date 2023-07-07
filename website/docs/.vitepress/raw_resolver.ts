import type { PluginOption, ResolvedConfig } from "vite";
import { readdir, stat, readFile, realpath } from "fs/promises";
import { resolve, relative, dirname } from "path";

type File = [string, string];

const raw = async (path: string): Promise<File[]> =>
  (await stat(path)).isDirectory()
    ? (
        await Promise.all(
          (await readdir(path)).map(name => raw(resolve(path, name)))
        )
      ).flat()
    : [await Promise.all([realpath(path), readFile(path, "utf8")])];

export function rawResolver(): PluginOption {
  const watchedFiles = new Map<string, string>();

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

      const root = id.slice(4);
      const files = await raw(root);
      const items: File[] = files.map(([path, content]) => {
        this.addWatchFile(path);
        watchedFiles.set(path.replace(/\\/g, "/"), id);
        return [relative(root, path).replace(/\\/g, "/"), content];
      });

      return "export default " + JSON.stringify(items);
    },

    handleHotUpdate(ctx) {
      if (!watchedFiles.has(ctx.file)) return;

      const rootId = watchedFiles.get(ctx.file)!;
      const root = ctx.server.moduleGraph.getModuleById(rootId);
      if (!root) return;

      console.log(`file update: ${ctx.file}`);
      ctx.server.moduleGraph.invalidateModule(root);
      ctx.server.ws.send({
        type: "full-reload",
      });
    },
  };
}
