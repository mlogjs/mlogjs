import { AddressResolver, SetCounterInstruction } from "../instructions";
import { THandler, es, IInstruction } from "../types";
import { nodeName } from "../utils";
import { LiteralValue, StoreValue } from "../values";
import { FunctionValue } from "../values/FunctionValue";

export const ArrowFunctionExpression: THandler = (c, scope, node: es.ArrowFunctionExpression) => {

	if (node.generator) return 

	const name = nodeName(node);
	scope = scope.createFunction(name);
	let { params, body } = node;

	if (node.expression) {
		body = {
			type: "BlockStatement",
			body: [{ type: "ReturnStatement", argument: body as es.Expression }],
		};
	}

	const fnParams = params.map((v) => {
		const id = v as es.Identifier;
		return scope.make(id.name, nodeName(id)) as StoreValue;
	});

	const addr = new LiteralValue(scope, null);
	const temp = new StoreValue(scope, "f" + name);
	const ret = new StoreValue(scope, "r" + name);

	const inst: IInstruction[] = [];

	inst.push(new AddressResolver(addr), ...c.handle(scope, body)[1]);

	const lastInst = inst.slice(-1)[0];
	if (!(lastInst instanceof SetCounterInstruction) || lastInst.args[2] !== ret) {
		inst.push(new SetCounterInstruction(ret));
	}

	inst.forEach((v) => (v.hidden = true));
	scope.inst.push(...inst);
	scope.function = new FunctionValue(scope, fnParams, addr, temp, ret, inst)
	return [scope.function, []];
};

export const FunctionDeclaration: THandler = (c, scope, node: es.FunctionDeclaration) => {
	return [scope.set(node.id.name, ArrowFunctionExpression(c, scope, node, null)[0]), []];
};

export const FunctionExpression: THandler = ArrowFunctionExpression;
