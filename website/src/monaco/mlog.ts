import type { Monaco } from "../util";
import type * as monaco from "monaco-editor";

const langId = "mlog";

export function registerMlogLang(monaco: Monaco) {
  monaco.languages.register({
    id: langId,
  });

  monaco.languages.setMonarchTokensProvider(langId, {
    flowInst: ["jump", "end", "wait", "stop"],
    tokenizer: {
      root: [
        [
          /^[a-z]+/,
          {
            cases: {
              "@flowInst": {
                token: "keyword.flow",
              },
              "@default": {
                token: "keyword",
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

  function getJumpLine({
    event,
    target,
  }: monaco.editor.IEditorMouseEvent): number | void {
    if (!event.ctrlKey) return;
    const { position } = target;
    if (!position) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lineContent = editor.getModel()!.getLineContent(position.lineNumber);
    const match = /^jump\s+(\d+)/.exec(lineContent);
    if (!match) return;
    return Number(match[1]) + 1; // mlog lines start at 0
  }
}
