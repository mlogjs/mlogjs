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
      "setprop",
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
        [/@[a-zA-Z-_0-9]+/, "variable"],
        [/(\w+:)?\d+:\d+/, "key.parameter"],
        [/&[a-zA-Z0-9:]+/, "variable.predefined"],
        [/\b[-+]?\d+\.\d+\b/, "number.float"],
        [/\b[-+]?\d+\b/, "number"],
        [/"(?:\\.|[^"\\])*"/g, "string"],
      ],
    },
  });
}

export function configureMlogLang(
  monaco: Monaco,
  editor: monaco.editor.IStandaloneCodeEditor,
) {
  const jumpUnderlineCollection = editor.createDecorationsCollection();
  const targettedLineCollection = editor.createDecorationsCollection();

  /** Indexes of lines that are either comments or labels */
  let ignoredIndexes: number[] = [];

  editor.updateOptions({
    lineNumbers(lineNumber) {
      if (ignoredIndexes.includes(lineNumber - 1)) return "-";
      return String(lineNumberToMlogIndex(ignoredIndexes, lineNumber));
    },
  });

  editor.onDidChangeModelContent(() => {
    const lines = editor.getModel()?.getLinesContent() ?? [];
    ignoredIndexes = findIgnoredIndexes(lines);
  });

  editor.onMouseDown(event => {
    const jumpLine = getJumpLine(event, ignoredIndexes);
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
    const jumpLine = getJumpLine(event, ignoredIndexes);
    if (jumpLine == undefined) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

  function getJumpLine(
    { event, target }: monaco.editor.IEditorMouseEvent,
    ignoredIndexes: number[],
  ): number | void {
    if (!event.ctrlKey) return;
    const { position } = target;
    if (!position) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lineContent = editor.getModel()!.getLineContent(position.lineNumber);
    const match = /^jump\s+(\d+)/.exec(lineContent);
    if (!match) return;
    const lineIndex = Number(match[1]);
    return mlogIndexToLineNumber(ignoredIndexes, lineIndex);
  }
}

/**
 * Returns a sorted array of the indexes of lines that contain labels or
 * comments
 */
function findIgnoredIndexes(lines: string[]): number[] {
  const indexes: number[] = [];

  const regex = /^\s*(#|\S+:)/;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!regex.test(line)) continue;
    indexes.push(i);
  }

  return indexes;
}

function lineNumberToMlogIndex(
  ignoredIndexes: number[],
  lineNumber: number,
): number {
  const index = lineNumber - 1;
  let difference = 0;
  for (const ignoredIndex of ignoredIndexes) {
    if (ignoredIndex <= index) difference++;
    else break;
  }

  return index - difference;
}

function mlogIndexToLineNumber(ignoredIndexes: number[], index: number) {
  let difference = 1; // line numbers start at 1
  for (const ignoredIndex of ignoredIndexes) {
    if (ignoredIndex <= index) difference++;
    else break;
  }

  return index + difference;
}
