#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "fs";
import { compile } from ".";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .command(
    "$0 [path] [out]",
    "compiles your Javascript file to MLog",
    yargs => {
      return yargs
        .positional("path", {
          describe: "path of the file to compile",
        })
        .positional("out", {
          describe: "path of the output file",
        });
    },
    argv => {
      const path = argv.path as string;
      const out = argv.out as string;
      if (!path) return console.log("missing required path argument");
      if (!out) return console.log("missing output path");
      if (!existsSync(path))
        return console.log(`file at ${path} does not exist`);
      const [output, error] = compile(
        readFileSync(path as string, { encoding: "utf-8" })
      );
      if (error) {
        console.log("Error: " + error.message);
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
