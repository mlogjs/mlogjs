import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { parse } from "node:path";
import { Compiler } from "../src";
import { expect, test } from "vitest";

const paths = readdirSync("test/in");

const compiler = new Compiler();

for (const path of paths) {
  const { name } = parse(path);
  test(name + " will compile", async () => {
    const input = await readFile(`test/in/${path}`, "utf8");
    const expected = await readFile(`test/out/${name}.mlog`, "utf8");
    const [actual, error] = compiler.compile(input);
    if (error) {
      throw error;
    }
    expect(actual).toBe(expected);
  });
}
