import { readdirSync } from "fs";
import { readFile } from "fs/promises";
import { parse } from "path";
import { compile } from "../src";

const paths = readdirSync("test/fail");

for (const path of paths) {
  const { name } = parse(path);
  test(name + " will fail", async () => {
    const input = await readFile(`test/fail/${path}`, "utf8");
    const error = input.split("\n")[0].split("//")[1].trim();
    expect(compile(input)[1]!.message).toBe(error);
  });
}
