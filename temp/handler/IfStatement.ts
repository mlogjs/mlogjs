import { THandler } from ".";
import { JumpLine, EJumpKind, AddressLine } from "../line";
import { LiteralValue } from "../value";
import * as es from "estree"

export const IfStatement : THandler = (c, scope, node: es.IfStatement) => {
    const lines = []
    const [test, testLines] = c.handleEvaluate(scope, node.test);
    if (test instanceof LiteralValue) {
        if (test.data) lines.push(...c.handle(scope, node.consequent)[1]);
        else lines.push(...c.handle(scope, node.alternate)[1])
        return [null, lines];
    }
    const endIfAddr = new LiteralValue(scope, null)
    lines.push(
        ...testLines,
        new JumpLine(endIfAddr, EJumpKind.NotEqual, test, new LiteralValue(scope, 0)),
        ...c.handle(scope, node.consequent)[1],
        new AddressLine(endIfAddr)
    )
    const endElseAddr = new LiteralValue(scope, null)
    if (node.alternate) lines.push(
        new JumpLine(endElseAddr, EJumpKind.Always),
        new AddressLine(endIfAddr),
        ...c.handle(scope, node.alternate)[1],
        new AddressLine(endElseAddr)
        )
    return [null, lines]
}