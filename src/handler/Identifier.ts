import { THandler } from ".";
import * as es from "estree"

export const Identifier: THandler  = (c, scope, node: es.Identifier) => {
    return [scope.get(node.name), []];
}