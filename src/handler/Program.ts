import { THandler } from ".";
import * as es from "estree"
import { Scope } from "../core";

export const Program : THandler = (c, scope, node : es.Program) => {
    return c.handleMany(Scope.createRoot({}), node.body);
}