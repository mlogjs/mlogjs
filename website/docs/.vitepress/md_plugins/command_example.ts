import type MarkdownIt from "markdown-it";
import Container from "markdown-it-container";
import * as es from "@babel/types";
import { resolve } from "path";
import { readFileSync, watchFile, type StatWatcher } from "fs";
import { parse } from "@babel/parser";
import { fileURLToPath } from "url";

interface EnvData {
  [name: string]: string;
}

const envKey = "mlogjsCommandExamples";
const filePath = resolve(
  fileURLToPath(import.meta.url),
  "../../../../../compiler/lib/commands.d.ts",
);
const infoRegex = /^command-example\s+([a-zA-Z\.]+)/;

let watcher: StatWatcher | undefined;

/**
 * Creates a custom markdown container that shows the code the example of a
 * given function in commands.d.ts
 */
export function commandExample(md: MarkdownIt) {
  Container(md, "command-example", {
    validate(params) {
      return infoRegex.test(params.trim());
    },
    render(tokens, index, options, env, self) {
      if (tokens[index].nesting === -1) return "";

      const match = tokens[index].info.trim().match(infoRegex)!;
      const id = match[1];

      const data = getEnvData(env);

      const code = data[id];
      if (!code) return "";

      const codeTokens = md.parse(`\`\`\`js\n${code}\n\`\`\``, env);

      return self.render(codeTokens, options, env);
    },
  });
}

function getEnvData(env: any): EnvData {
  env[envKey] ??= loadEnvData(env);
  return env[envKey];
}

function loadEnvData(env: any) {
  const content = readFileSync(filePath, "utf8");
  watcher ??= watchFile(filePath, (curr, prev) => {
    env[envKey] = undefined;
  });
  const ast = parse(content, {
    plugins: ["typescript"],
    sourceType: "module",
  });

  if (ast.errors.length > 0) {
    throw new Error(
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      `Error parsing commands declaration file: ${ast.errors[0]}`,
      { cause: ast.errors[0] },
    );
  }

  return traverseAst(ast);
}

function traverseAst(node: es.Node): Record<string, string> {
  if (es.isFile(node)) return traverseAst(node.program);

  if (es.isTSModuleDeclaration(node)) {
    const id = node.id;
    if (es.isIdentifier(id) && id.name !== "global") {
      const name = id.name;
      const examples = traverseAst(node.body);
      const result: Record<string, string> = {};
      for (const key in examples) {
        result[`${name}.${key}`] = examples[key];
      }
      return result;
    }
    return traverseAst(node.body);
  }
  if (es.isBlock(node) || es.isProgram(node) || es.isTSModuleBlock(node)) {
    const result = {};
    for (const child of node.body) {
      Object.assign(result, traverseAst(child));
    }
    return result;
  }
  if (es.isTSDeclareFunction(node)) {
    const name = node.id?.name;
    const comment = node.leadingComments?.find(
      comment => comment.type === "CommentBlock",
    );
    if (!name || !comment) return {};

    const code = extractCodeExample(comment.value) ?? "no fence";
    return {
      [name]: code,
    };
  }
  return {};
}

function extractCodeExample(comment: string) {
  const lines = comment.replace(/^\s*\*/gm, "").split("\n");
  const start = findFenceTag(lines, 0);
  if (start === null) return null;

  const end = findFenceTag(lines, start + 1);
  if (end === null) return null;

  const indentation = getIndentation(lines[start]);

  let code = "";
  for (let i = start + 1; i < end; i++) {
    code += lines[i].slice(indentation);
    code += "\n";
  }

  return code;
}

function findFenceTag(lines: string[], start: number) {
  const regex = /\s+```/;
  for (let i = start; i < lines.length; i++) {
    if (regex.test(lines[i])) return i;
  }
  return null;
}

function getIndentation(line: string) {
  return line.length - line.trimStart().length;
}
