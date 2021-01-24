#!/usr/bin/env node

const compile = require("../src");
const fs = require("fs");
const path = require("path");
const { App } = require("cliful");
const clipboardy = require("clipboardy");

const app = new App({
  name: "mlogcc",
  description: "Compiles Javascript to Mindustry Logic Code!",
  author: "str1z",
  cmds: [
    {
      name: "compile file",
      description: "Compiles your Javascript to Mlog! If the ouput file is not specified, it will copy the generated code into your clipboard.",
      args: [
        { name: "input", type: "string", required: true },
        { name: "output", type: "string" },
      ],
      exec: ({ input, output }) => {
        input = path.resolve(process.cwd(), input);
        const content = fs.readFileSync(input, { encoding: "utf8" });
        const { out, error, start, end } = compile(content);
        if (error) return console.log(`${error.message} (from ${start.line}:${start.column} to ${end.line}:${end.column})`);
        if (output) {
          output = path.resolve(process.cwd(), output);
          fs.writeFileSync(output, out, { encoding: "utf8" });
        } else clipboardy.writeSync(out);
      },
    },
  ],
});

app.useHelp();
app.useInfo();
app.exec();
