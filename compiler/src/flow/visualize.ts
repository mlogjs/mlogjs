import { ICompilerContext } from "../CompilerContext";
import { Block } from "./block";
import { traverse, traverseReversePostOrder } from "./graph";
import { ValueId } from "./id";
import { TBlockInstruction, TBlockEndInstruction } from "./instructions";

/**
 * Debug function that you can use to visualize the compiler's intermediate
 * representation during compilation as a directed graph in DOT notation.
 */
export function generateGraphVizDOTString(c: ICompilerContext, entry: Block) {
  let result = "digraph mlogjs_cfg {\n" + "node [shape=rectangle];\n";
  const ids = new Map<Block, string>();

  traverseReversePostOrder(entry, block => {
    const id = `block${ids.size}`;
    ids.set(block, id);
  });

  const n = (id: ValueId) => c.getValueOrTemp(id)?.toMlogString();
  function instToString(
    inst: TBlockInstruction | TBlockEndInstruction,
  ): string {
    switch (inst.type) {
      case "alloc-local":
        return `alloc-local ${n(inst.address)}`;
      case "load":
        return `${n(inst.out)} = load ${n(inst.address)}`;
      case "store":
        return `store ${n(inst.address)} ${n(inst.value)}`;
      case "value-get":
        return `${n(inst.out)} = get ${n(inst.object)} ${n(inst.key)}`;
      case "value-set":
        return `set ${n(inst.target)} ${n(inst.key)} ${n(inst.value)}`;
      case "binary-operation":
        return `${n(inst.out)} = ${n(inst.left)} ${inst.operator} ${n(
          inst.right,
        )}`;
      case "binary-select":
        return `${n(inst.out)} = select ${n(inst.condition)} ? ${n(inst.whenTrue)} : ${n(inst.whenFalse)}`;
      case "unary-operation":
        return `${n(inst.out)} = ${inst.operator} ${n(inst.value)}`;
      case "call":
        return `${n(inst.out)} = call ${n(inst.callee)} ${inst.args
          .map(n)
          .join(", ")}`;
      case "native":
        return `native(${inst.args[0]}) ${inst.args
          .slice(1)
          .map(arg => (typeof arg === "string" ? arg : n(arg)))
          .join(" ")}`;
      case "break":
        return `break ${ids.get(inst.target.block)} (${inst.blockParameters.map(p => n(p.value)).join(", ")})`;
      case "break-if":
        return `break-if ${n(inst.condition)} ${ids.get(
          inst.consequent.block,
        )} ${ids.get(inst.alternate.block)}`;
      case "return":
        return `return ${n(inst.value)}`;
      case "end":
        return "end";
      case "stop":
        return "stop";
      case "end-if":
        return `end-if ${n(inst.condition)} ${ids.get(inst.alternate.block)}`;
      default:
        throw new Error(
          `Missing representation for instruction of type ${
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            (inst as any).type
          }`,
        );
    }
  }

  traverseReversePostOrder(entry, block => {
    const id = ids.get(block)!;
    result += `${id} [label="${id}\\lparams: (${block.parameters.map(p => `${n(p.variable)}=${n(p.value)}`).join(", ")})\\l\\l${[
      ...block.instructions,
      block.endInstruction,
    ]
      .filter((value): value is NonNullable<typeof value> => !!value)
      .map(instToString)
      .join("\\l")
      .replace(/"/g, "'")}\\l"];\n`;

    for (const edge of block.childEdges) {
      result += `${id} -> ${ids.get(edge.block)};\n`;
    }
  });

  result += "}\n";

  return result;
}

export function visualizeImmediateDominators(
  c: ICompilerContext,
  entry: Block,
  idoms: Map<Block, Block>,
  frontiers: Map<Block, Set<Block>>,
) {
  let result = "digraph mlogjs_cfg {\n" + "node [shape=rectangle];\n";
  const ids = new Map<Block, string>();

  traverseReversePostOrder(entry, block => {
    const id = `block${ids.size}`;
    ids.set(block, id);
  });

  const n = (id: ValueId) => c.getValueOrTemp(id)?.toMlogString();
  function instToString(
    inst: TBlockInstruction | TBlockEndInstruction,
  ): string {
    switch (inst.type) {
      case "alloc-local":
        return `alloc-local ${n(inst.address)}`;
      case "load":
        return `${n(inst.out)} = load ${n(inst.address)}`;
      case "store":
        return `store ${n(inst.address)} ${n(inst.value)}`;
      case "value-get":
        return `${n(inst.out)} = get ${n(inst.object)} ${n(inst.key)}`;
      case "value-set":
        return `set ${n(inst.target)} ${n(inst.key)} ${n(inst.value)}`;
      case "binary-operation":
        return `${n(inst.out)} = ${n(inst.left)} ${inst.operator} ${n(
          inst.right,
        )}`;
      case "unary-operation":
        return `${n(inst.out)} = ${inst.operator} ${n(inst.value)}`;
      case "call":
        return `${n(inst.out)} = call ${n(inst.callee)} ${inst.args
          .map(n)
          .join(", ")}`;
      case "native":
        return `native(${inst.args[0]}) ${inst.args
          .slice(1)
          .map(arg => (typeof arg === "string" ? arg : n(arg)))
          .join(" ")}`;
      case "break":
        return `break ${ids.get(inst.target.block)}`;
      case "break-if":
        return `break-if ${n(inst.condition)} ${ids.get(
          inst.consequent.block,
        )} ${ids.get(inst.alternate.block)}`;
      case "return":
        return `return ${n(inst.value)}`;
      case "end":
        return "end";
      case "stop":
        return "stop";
      case "end-if":
        return `end-if ${n(inst.condition)} ${ids.get(inst.alternate.block)}`;
      default:
        throw new Error(
          `Missing representation for instruction of type ${
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            (inst as any).type
          }`,
        );
    }
  }

  traverseReversePostOrder(entry, block => {
    const id = ids.get(block)!;

    const frontiersText = `Frontiers: {${[...(frontiers.get(block) ?? [])]
      .map(block => ids.get(block))
      .join(", ")}}`;
    result += `${id} [label="${id} (${ids.get(
      idoms.get(block)!,
    )})\\l${frontiersText}\\l\\l${[...block.instructions, block.endInstruction]
      .filter((value): value is NonNullable<typeof value> => !!value)
      .map(instToString)
      .join("\\l")
      .replace(/"/g, "'")}\\l"];\n`;

    for (const edge of block.childEdges) {
      result += `${id} -> ${ids.get(edge.block)};\n`;
    }
  });

  result += "}\n";

  return result;
}
