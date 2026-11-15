import { expect, test } from "vitest";
import { Compiler } from "../src";

const compiler = new Compiler();

test("globalThis resolves built-ins shadowed in the module", () => {
  const expected = compiler.compile("print(Math.abs(Vars.time));");
  const actual = compiler.compile(`
    const print = 1;
    const Math = 2;
    const Vars = 3;
    globalThis.print(globalThis.Math.abs(globalThis.Vars.time));
  `);
  expect(expected[1]).toBeNull();
  expect(actual).toEqual(expected);
});

test("globalThis supports computed access and references itself", () => {
  expect(compiler.compile('globalThis.globalThis["print"]("hello");')).toEqual(
    compiler.compile('print("hello");'),
  );
});

test("globalThis does not expose module-local declarations", () => {
  const [, error] = compiler.compile(
    "const local = 1; print(globalThis.local);",
  );
  expect(error?.message).toContain("local");
  expect(error?.message).toContain("not present");
});
