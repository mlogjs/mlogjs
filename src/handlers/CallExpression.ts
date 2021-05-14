import { es, IInstruction, THandler } from "../types";


export const CallExpression: THandler  = (c, scope, node: es.CallExpression) => {
    const inst : IInstruction[] = []

    const args = node.arguments.map(node => {
        const [v, i] = c.handleEval(scope, node)
        inst.push(...i)
        return v
    })
    
    const [callee, calleeInst] = c.handleEval(scope, node.callee)
    inst.push(...calleeInst)

    const [callValue, callInst] = callee.call(scope, args)
    inst.push(...callInst)

    return [callValue, inst]
}

export const NewExpression = CallExpression