import {
  existsSync,
  readFileSync,
  writeFileSync,
  cpSync,
  rmSync,
  watchFile,
} from "node:fs";
import { hideBin } from "yargs/helpers";
import { highlight } from "cli-highlight";
import yargs from "yargs";
import chalk from "chalk";
import { join, parse, resolve } from "node:path";
import { Compiler, CompilerOptions } from "../index";
import { getInnerTSConfig, getLibFolderPath, getRootTSConfig } from "./files";

// eslint-disable-next-line @typescript-eslint/no-floating-promises
yargs(hideBin(process.argv))
  .command(
    "setup [dir]",
    "Copies the compiler type definitions in the current folder",
    yargs => {
      return yargs
        .positional("dir", {
          default: ".",
          type: "string",
          describe:
            "The directory where the type definitions folder will be copied",
        })
        .option("tsconfig", {
          type: "boolean",
          default: false,
          describe:
            "Wether a tsconfig.json file should be created in the current directory",
        });
    },
    argv => {
      const dir = resolve(process.cwd(), argv.dir);
      console.log(process.cwd());
      console.log(argv.dir);
      setup(dir, argv.tsconfig);
    },
  )
  .command(
    "$0 [path] [out]",
    "compiles your Javascript file to MLog",
    yargs => {
      return yargs
        .positional("path", {
          describe: "path of the file to compile",
          type: "string",
        })
        .positional("out", {
          describe: "path of the output file",
          type: "string",
        })
        .option("compact-names", {
          type: "boolean",
          default: false,
          describe:
            "Wether the compiler should preserve or compact variable and function names",
        })
        .option("watch", {
          type: "boolean",
          default: false,
          describe: "Wether the compiler should watch for file changes",
        });
    },
    argv => {
      const path = argv.path;
      if (!path) return console.log("missing required path argument");
      if (!existsSync(path))
        return console.log(`file at ${path} does not exist`);
      const out = argv.out ?? defaultOutPath(path);
      if (path == out)
        return console.log("The out path cannot be the same as the input path");

      const options: CompilerOptions = {
        compactNames: argv["compact-names"],
      };

      compile(path, out, options);

      if (!argv.watch) return;
      // using interval of 600 milliseconds
      // because 1 second might feel too slow to the user
      watchFile(path, { interval: 600 }, () => compile(path, out, options));
    },
  )
  .help()
  .scriptName("mlogjs")
  .demandCommand()
  .parse();

function setup(dir: string, tsconfig: boolean) {
  const dotDir = join(dir, ".mlogjs");

  if (existsSync(dotDir)) {
    rmSync(dotDir, { recursive: true });
  }

  const libPath = getLibFolderPath();
  cpSync(libPath, join(dotDir, "lib"), {
    recursive: true,
  });

  const innerTSConfig = getInnerTSConfig();
  writeFileSync(join(dotDir, "tsconfig.json"), innerTSConfig);

  if (!tsconfig) return;
  const rootTSConfig = getRootTSConfig();
  writeFileSync(join(dir, "tsconfig.json"), rootTSConfig);
}

function compile(path: string, outPath: string, options: CompilerOptions) {
  const resolvedPath = resolve(process.cwd(), path);
  const code = readFileSync(path, "utf8");
  const compiler = new Compiler(options);
  const [result, error] = compiler.compile(code);

  if (!error) {
    writeFileSync(outPath, result);
    console.log(
      `Success: Compiled ${path}. Your compiled code is at ${outPath}.`,
    );
    return;
  }

  if (!error.loc) {
    console.log(error.inner ?? error);
    return;
  }

  const { start, end } = error.loc;

  const lines = code.split("\n");
  console.log(
    chalk.cyanBright([resolvedPath, start.line, start.column].join(":")),
  );

  for (
    let i = Math.max(start.line - 3, 0);
    i < Math.min(end.line + 2, lines.length);
    i++
  ) {
    const n = i + 1;
    if (n !== start.line) continue;
    const head = chalk.gray(`${n} | `.padStart(6, " "));
    console.log(head + highlight(lines[i], { language: "ts" }));
    console.log(chalk.red(" ".repeat(6 + start.column) + "^ " + error.message));
  }
}

function defaultOutPath(path: string) {
  const parsed = parse(path);
  return join(parsed.dir, `${parsed.name}.mlog`);
}
