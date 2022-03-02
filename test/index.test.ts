import { readdirSync } from "fs";
import { readFile } from "fs/promises";
import { parse } from "path";
import { compile } from "../src";

const paths = readdirSync("test/in");

for (const path of paths) {
  const { name } = parse(path);
  test(name, async () => {
    const input = await readFile(`test/in/${path}`, "utf8");
    const expected = await readFile(`test/out/${name}.mlog`, "utf8");
    const actual = compile(input);
    expect(actual).toBe(expected);
  });
}
