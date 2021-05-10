
import { TValue } from "../types"
import { InstructionBase } from "./InstructionBase"

export enum EJumpKind {
    Equal = "equal",
    NotEqual = "notEqual",
    LessThan = "lessThan",
    LessThanEq = "lessThanEq",
    GreaterThan = "greaterThan",
    GreaterThanEq = "greaterThanEq",
    StrictEqual = "strictEqual",
    Always = "always"
}

export class JumpInstruction extends InstructionBase {
    constructor(address: TValue, kind: EJumpKind, left?: TValue, right?:TValue) {
        super("jump",address, kind, left, right)
    }
}