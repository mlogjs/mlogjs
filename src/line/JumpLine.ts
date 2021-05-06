import {LineBase} from "."
import { IValue } from "../value"

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

export class JumpLine extends LineBase {
    constructor(address: IValue, kind: EJumpKind, left?: IValue, right?:IValue) {
        super("jump",address, kind, left, right)
    }
}