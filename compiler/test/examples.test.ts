import { readdirSync } from "fs";
import { readFile } from "fs/promises";
import { parse } from "path";
import { Compiler } from "../src";

const paths = readdirSync("test/examples");

const compiler = new Compiler();

for (const path of paths) {
  const { name, ext } = parse(path);
  if (ext !== ".ts" && ext !== ".js") continue;

  test(name + " will compile", async () => {
    const input = await readFile(`test/examples/${path}`, "utf8");
    const expected = await readFile(`test/examples/${name}.mlog`, "utf8");
    const [actual, error] = compiler.compile(input);

    if (error) {
      throw error;
    }
    expect(actual).toBe(expected);
  });
}
