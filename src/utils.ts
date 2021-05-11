import { es } from "./types";

export function nodeName(node: es.Node) {
    const {line, column} = node.loc.start
    return line + ":" + column
}