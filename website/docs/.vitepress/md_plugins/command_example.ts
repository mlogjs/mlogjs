import type MarkdownIt from "markdown-it";
import Container from "markdown-it-container";
import * as es from "@babel/types";
import { resolve } from "path";
import { readFileSync, watchFile, type StatWatcher } from "fs";
import { parse } from "@babel/parser";
import { fileURLToPath } from "url";
import type Token from "markdown-it/lib/token";

interface EnvData {
  [name: string]: string;
}

const envKey = "mlogjsCommandExamples";
const filePath = resolve(
  fileURLToPath(import.meta.url),
  "../../../../../compiler/lib/commands.d.ts",
);

let watcher: StatWatcher | undefined;

/**
 * Creates a custom markdown container that shows the code the example of a
 * given function in commands.d.ts
 */
export function commandExample(md: MarkdownIt) {
  Container(md, "command-example", {
    render(tokens, index, options, env, self) {
      if (tokens[index].nesting === -1) return "";

      const data = getEnvData(env);
      const parsedId = findExampleId(tokens, index);

      if (!parsedId) return "";

      const code = data[parsedId] ?? "no fence";
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

function findExampleId(tokens: Token[], index: number) {
  let inHeading = false;
  for (let i = index - 1; i >= 0; i--) {
    const token = tokens[i];
    if (token.type === "heading_close") {
      inHeading = true;
    }

    if (inHeading && token.type === "inline") {
      return token.children?.find(child => child.type === "code_inline")
        ?.content;
    }
  }
  return null;
}

function traverseAst(node: es.Node): Record<string, string> {
  if (es.isFile(node)) return traverseAst(node.program);

  if (es.isTSModuleDeclaration(node)) {
    const id = node.id;
    if (es.isIdentifier(id) && id.name !== "global") {
      const name = id.name;
      const examples = traverseAst(node.body);
      const result: Record<string, string> = {};
      const code = extractCodeExample(node);
      if (code) {
        result[name] = code;
      }

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
    if (!name) return {};

    const code = extractCodeExample(node);
    if (!code) return {};

    return {
      [name]: code,
    };
  }
  return {};
}

function extractCodeExample(node: es.Node) {
  const comment = node.leadingComments?.find(
    comment => comment.type === "CommentBlock",
  );
  if (!comment) return null;

  const lines = comment.value.replace(/^\s*\*/gm, "").split("\n");
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
