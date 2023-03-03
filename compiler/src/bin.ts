import { existsSync, readFileSync, writeFileSync, cpSync } from "fs";
import { hideBin } from "yargs/helpers";
import { Compiler } from ".";
import { highlight } from "cli-highlight";
import yargs from "yargs";
import chalk from "chalk";
import { join, parse, resolve } from "path";

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
      // this approach depends on the fact that the
      // output bin.cjs file is one folder bellow the package folder
      const currentPath = __dirname.replace(/\\/g, "/");
      const parent = currentPath.split("/").slice(0, -1).join("/");
      const libPath = join(parent, "lib");
      const dir = resolve(process.cwd(), argv.dir);
      const target = join(dir, "lib");
      cpSync(libPath, target, {
        recursive: true,
      });

      if (!argv.tsconfig) return;

      const tsconfigPath = join(dir, "tsconfig.json");
      const json = {
        compilerOptions: {
          allowJs: true,
          checkJs: true,
          moduleDetection: "force",
          noEmit: true,
          noLib: true,
          target: "ESNext",
        },
        include: ["./lib", "*.js", "*.ts"],
        exclude: ["node_modules"],
      };
      writeFileSync(tsconfigPath, JSON.stringify(json, null, "\t"));
    }
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
      const compiler = new Compiler({
        compactNames: argv["compact-names"],
      });
      const code = readFileSync(path, "utf8");
      const [output, error] = compiler.compile(code);
      if (error) {
        if (!error.loc) {
          console.log(error.inner ?? error);
          return;
        }
        const { start, end } = error.loc;

        const lines = code.split("\n");
        console.log(
          chalk.cyanBright([resolve(path), start.line, start.column].join(":"))
        );
        for (
          let i = Math.max(start.line - 3, 0);
          i < Math.min(end.line + 2, lines.length);
          i++
        ) {
          const n = i + 1;
          if (n !== start.line) continue;
          const head = chalk.gray(`${n} | `.padStart(6, " "));
          console.log(head + highlight(lines[i], { language: "js" }));
          console.log(
            chalk.red(" ".repeat(6 + start.column) + "^ " + error.message)
          );
        }

        return;
      }
      writeFileSync(out, output);
      console.log(
        `Success: Compiled ${path}. Your compiled code is at ${out}.`
      );
    }
  )
  .help()
  .scriptName("mlogjs")
  .demandCommand()
  .parse();

function defaultOutPath(path: string) {
  const parsed = parse(path);
  return join(parsed.dir, `${parsed.name}.mlog`);
}
