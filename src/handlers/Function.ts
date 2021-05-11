import { AddressResolver, EJumpKind, JumpInstruction, SetCounterInstruction } from "../instructions";
import { THandler, es } from "../types";
import { nodeName } from "../utils";
import { LiteralValue, StoreValue } from "../values";
import { FunctionValue } from "../values/FunctionValue";


export const FunctionExpression: THandler = (c, scope, node: es.FunctionExpression) => {
	const name = nodeName(node);
	scope = scope.createFunction(name);
	const { params, body } = node;

	const fnParams = params.map((v) => {
		const id = v as es.Identifier;
		return scope.make(id.name, nodeName(id)) as StoreValue;
	});

	const addr = new LiteralValue(scope, null);
	const temp = new StoreValue(scope, "f" + name);
	const ret = new StoreValue(scope, "r" + name);

    scope.fnRet = ret
    scope.fnTemp = temp

	scope.extraInstructions.push(
        new AddressResolver(addr),
		...c.handle(scope, body)[1],
        
	);
    
    const lastInst = scope.extraInstructions.slice(-1)[0]
    if (!(lastInst instanceof SetCounterInstruction) || lastInst.args[2] !== ret) {
        scope.extraInstructions.push(new SetCounterInstruction(ret))
    }

	return [new FunctionValue(scope, fnParams, addr, temp, ret), []];
};
