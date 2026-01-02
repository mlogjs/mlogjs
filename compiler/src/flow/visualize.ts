import { ICompilerContext } from "../CompilerContext";
import { Block, BlockEdge } from "./block";
import { traverseReversePostOrder } from "./graph";
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

  function edgeToString(edge: BlockEdge) {
    let result = ids.get(edge.block)!;

    if (edge.args.length > 0) {
      result += ` (${edge.args.map(arg => String(arg.value)).join(", ")})`;
    }

    return result;
  }

  function instToString(
    inst: TBlockInstruction | TBlockEndInstruction,
  ): string {
    switch (inst.type) {
      case "alloc-local":
        return `${inst.address} = alloc-local ${n(inst.address)}`;
      case "load-literal":
        return `${inst.out} = load-literal ${JSON.stringify(inst.literal)}`;
      case "load":
        return `${inst.out} = load ${inst.address}`;
      case "store":
        return `store ${inst.address} ${inst.value}`;
      case "value-get":
        return `${inst.out} = get ${inst.object} ${inst.key}`;
      case "value-set":
        return `set ${inst.target} ${inst.key} ${inst.value}`;
      case "binary-operation":
        return `${inst.out} = ${inst.left} ${inst.operator} ${inst.right}`;
      case "binary-select":
        return `${inst.out} = select ${inst.condition} ? ${inst.whenTrue} : ${inst.whenFalse}`;
      case "unary-operation":
        return `${inst.out} = ${inst.operator} ${inst.value}`;
      case "call":
        return `${inst.out} = call ${inst.callee} ${inst.args
          .map(String)
          .join(", ")}`;
      case "native":
        return `native(${inst.args[0]}) ${inst.args
          .slice(1)
          .map(String)
          .join(" ")}`;
      case "break":
        return `break ${edgeToString(inst.target)}`;
      case "break-if":
        return `break-if ${inst.condition} ${edgeToString(
          inst.consequent,
        )} ${edgeToString(inst.alternate)}`;
      case "return":
        return `return ${inst.value}`;
      case "end":
        return "end";
      case "stop":
        return "stop";
      case "end-if":
        return `end-if ${inst.condition} ${edgeToString(inst.alternate)}`;
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
    result += `${id} [label="${id}\\lparents: ${block.parents.map(parent => ids.get(parent) ?? "null").join(", ")}\\lparams: (${block.parameters.map(p => `${p.variable}=${p.value}`).join(", ")})\\l\\l${[
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
