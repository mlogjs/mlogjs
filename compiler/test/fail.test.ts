import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { parse } from "node:path";
import { Compiler } from "../src";
import { expect, test } from "vitest";

const paths = readdirSync("test/fail");

const compiler = new Compiler();

for (const path of paths) {
  const { name } = parse(path);

  test(name + " will fail", async () => {
    const input = await readFile(`test/fail/${path}`, "utf8");
    const error = input.split("\n")[0].split("//")[1].trim();
    expect(compiler.compile(input)[1]!.message).toBe(error);
  });
}
