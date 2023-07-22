import MarkdownIt from "markdown-it";
import Container from "markdown-it-container";
import type Token from "markdown-it/lib/token";
import { Compiler } from "mlogjs";

const extensions = ["js", "ts"];

/**
 * This plugin creates a markdown container named `mlogjs-output`.
 *
 * The container will seek the first code fence contained within itself
 * and append a new code fence showing the compiler output of that code.
 *
 * Something worth noting is that `markdown-it-container` does not handle
 * container nesting very well, so you might need to remove trailing `:::`
 * in those cases.
 *
 * @param md
 */
export function mlogjsOutputContainer(md: MarkdownIt) {
  Container(md, "mlogjs-output", {
    render(tokens, index, options, env, self) {
      if (tokens[index].nesting === 1) return "";
      const endIndex = index;
      const startIndex = findOpenIndex(tokens, endIndex);
      const codeFence = findCodeFence(tokens, startIndex, endIndex);

      if (!codeFence) return "";
      const compiler = new Compiler({
        compactNames: false,
        sourcemap: false,
      });

      const [output, error] = compiler.compile(codeFence.content);
      if (error) {
        console.error(error);
        return "";
      }

      const mlogTokens = md.parse(`\`\`\`mlog\n${output}\n\`\`\``, env);
      return self.render(mlogTokens, options, env);
    },
  });
}

function findOpenIndex(tokens: Token[], end: number) {
  let nesting = -1;
  let start = end - 1;
  while (nesting !== 0 && start >= 0) {
    const token = tokens[start];
    if (token.type.startsWith("container_mlogjs-output")) {
      nesting += token.nesting;
    }
    start--;
  }
  return start + 1;
}

function findCodeFence(tokens: Token[], start: number, end: number) {
  for (let i = start; i < end; i++) {
    const token = tokens[i];
    if (
      token.type === "fence" &&
      token.tag === "code" &&
      extensions.includes(token.info)
    )
      return token;
  }
  return null;
}
