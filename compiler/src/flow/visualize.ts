import { ICompilerContext } from "../CompilerContext";
import { digraph } from "../graphviz";
import { Node } from "../graphviz/node";
import { Block } from "./block";
import { traverse } from "./graph";
import { ValueId } from "./id";
import { TBlockInstruction, TBlockEndInstruction } from "./instructions";

export function generateGraphVizDOTString(c: ICompilerContext, entry: Block) {
  const ids = new Map<Block, string>();
  const nodes = new Map<Block, Node>();
  const graph = digraph("G");

  const n = (id: ValueId) => c.getValueOrTemp(id)?.toMlogString();
  function instToString(
    inst: TBlockInstruction | TBlockEndInstruction,
  ): string {
    switch (inst.type) {
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
      default:
        throw new Error(
          `Missing representation for instruction of type ${
            (inst as any).type
          }`,
        );
    }
  }

  traverse(entry, block => {
    const id = `block${ids.size}`;
    ids.set(block, id);
    nodes.set(block, graph.addNode(id));
  });

  traverse(entry, block => {
    const id = ids.get(block)!;
    const node = nodes.get(block)!;
    node.set(
      "label",
      `${id}\n\n${[...block.instructions, block.endInstruction]
        .filter((value): value is NonNullable<typeof value> => !!value)
        .map(instToString)
        .join("\n")
        .replace(/"/g, "'")}`,
    );
    for (const edge of block.childEdges) {
      const target = ids.get(edge.block);
      console.log(target);
      graph.addEdge(id, ids.get(edge.block)!, undefined);
    }
  });

  return graph.to_dot();
}
