import { IValue } from "../value";

export interface ILine {
    hidden: boolean
    serialize(): string
    processAddressLine(addr: number): void
}

export type TResLines = [IValue, ILine[]]
export * from "./LineBase"
export * from "./JumpLine"
export * from "./OperationLine"
export * from "./SetLine"
export * from "./EndLine"
export * from "./AddressLine"