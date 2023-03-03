import type { Monaco } from "../util";
import type * as monaco from "monaco-editor";

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
      "lookup",
      "ubind",
      "ucontrol",
      "uradar",
      "ulocate",
      "packcolor",
      "getblock",
      "setblock",
      "spawn",
      "status",
      "spawnwave",
      "setrule",
      "message",
      "cutscene",
      "explosion",
      "setrate",
      "fetch",
      "getflag",
      "setflag",
    ],
    flowInst: ["jump", "end", "wait", "stop"],
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
        [/(\w+:)?\d+:\d+/, "key.parameter"],
        [/&[a-zA-Z0-9:]+/, "variable.predefined"],
        [/\b[\-+]?\d+\.\d+\b/, "number.float"],
        [/\b[\-+]?\d+\b/, "number"],
        [/"(?:\\.|[^"\\])*"/g, "string"],
      ],
    },
  });
}

export function configureMlogLang(
  monaco: Monaco,
  editor: monaco.editor.IStandaloneCodeEditor
) {
  const jumpUnderlineCollection = editor.createDecorationsCollection();
  const targettedLineCollection = editor.createDecorationsCollection();
  editor.onMouseDown(event => {
    const jumpLine = getJumpLine(event);
    if (jumpLine == undefined) return;

    editor.revealLineInCenter(jumpLine, monaco.editor.ScrollType.Smooth);
    editor.setPosition({ lineNumber: jumpLine, column: 1 });
    targettedLineCollection.set([
      {
        range: new monaco.Range(jumpLine, 1, jumpLine, 1),
        options: {
          isWholeLine: true,
          className: "symbolHighlight",
        },
      },
    ]);
  });

  editor.onMouseMove(event => {
    jumpUnderlineCollection.clear();
    targettedLineCollection.clear();
    const jumpLine = getJumpLine(event);
    if (jumpLine == undefined) return;
    const line = event.target.position!.lineNumber;

    jumpUnderlineCollection.set([
      {
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: true,
          inlineClassName: "goto-definition-link",
        },
      },
    ]);
  });

  editor.onMouseUp(() => jumpUnderlineCollection.clear());

  function getJumpLine({
    event,
    target,
  }: monaco.editor.IEditorMouseEvent): number | void {
    if (!event.ctrlKey) return;
    const { position } = target;
    if (!position) return;
    const lineContent = editor.getModel()!.getLineContent(position.lineNumber);
    const match = /^jump\s+(\d+)/.exec(lineContent);
    if (!match) return;
    return Number(match[1]) + 1; // mlog lines start at 0
  }
}
