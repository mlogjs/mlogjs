import { readdirSync } from "fs";
import { readFile } from "fs/promises";
import { parse } from "path";
import { compile } from "../src";

const paths = readdirSync("test/in");

for (const path of paths) {
  const { name } = parse(path);
  test(name + " will compile", async () => {
    const input = await readFile(`test/in/${path}`, "utf8");
    const expected = await readFile(`test/out/${name}.mlog`, "utf8");
    const [actual, error] = compile(input);
    if (error) {
      console.error(error)
    }
    expect(actual).toBe(expected);
  });
}
