import * as es from "estree"
import { THandler } from "../handler";

type PartialRecord<K extends string | number | symbol, T> = { [P in K]?: T; };
export type THandlerMap = PartialRecord<es.Node["type"], THandler>

export * from "./Scope";
export * from "./Compiler";
