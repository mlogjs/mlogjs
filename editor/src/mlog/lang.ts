import { Monaco } from "@monaco-editor/react";

const langId = "mlog";
export function registerMlogLang(monaco: Monaco) {
  monaco.languages.register({
    id: langId,
  });

  monaco.languages.setMonarchTokensProvider(langId, {
    instruction: [
      "read",
      "write",
      "draw",
      "print",
      "drawflush",
      "printflush",
      "getlink",
      "control",
      "radar",
      "sensor",
      "set",
      "op",
      "wait",
      "lookup",
      "ubind",
      "ucontrol",
      "uradar",
      "ulocate",
    ],
    flowInst: ["jump", "end"],
    operator: [
      "add",
      "sub",
      "mul",
      "div",
      "idiv",
      "mod",
      "pow",
      "equal",
      "notEqual",
      "land",
      "lessThan",
      "lessThanEq",
      "greaterThan",
      "greaterThanEq",
      "strictEqual",
      "shl",
      "shr",
      "or",
      "and",
      "xor",
      "not",
      "max",
      "min",
      "angle",
      "len",
      "noise",
      "abs",
      "log",
      "log10",
      "floor",
      "ceil",
      "sqrt",
      "rand",
      "sin",
      "cos",
      "tan",
      "asin",
      "acos",
      "atan",
    ],
    tokenizer: {
      root: [
        [
          /^[a-z]+/,
          {
            cases: {
              "@instruction": {
                token: "keyword",
              },
              "@flowInst": {
                token: "keyword.flow",
              },
            },
          },
        ],
        [/\@[a-zA-Z-_]+/, "variable"],
        [/\d+:\d+/, "key.parameter"],
        [/&[a-z0-9:]+/, "variable.predefined"],
        [/[\-+]?\d+\.\d+/, "number.float"],
        [/[\-+]?\d+\b/, "number"],
      ],
    },
  });
}
