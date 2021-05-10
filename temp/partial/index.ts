import { IValue } from "../value";

export interface Constructor<T> {
    new (...args: any[]): T;
    prototype: T;
}

export type TValueConstructor = Constructor<IValue>



export * from "./AssignOperational"
export * from "./BinaryOperational"
export * from "./LogicalOperational"
export * from "./Operational"
export * from "./UnaryOperational"
export * from "./UpdateOperational"
export * from "./MappedOperation"