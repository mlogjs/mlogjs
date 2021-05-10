import { es, IScope, THandler, TValueInstructions } from "./types";
import * as handlers from "./handlers"
import { parseScript } from "esprima";
import { EndInstruction } from "./instructions";

type THandlerMap = {[k in es.Node["type"]]?: THandler};

export class Compiler {
	protected stackName?: string;
	protected usingStack: boolean;
	protected handlers: THandlerMap = handlers;

	constructor(stackName?: string) {
		this.usingStack = !!stackName;
		this.stackName = stackName;
	}

	compile(script: string): string {
		const program = this.parse(script);
		const resLines = this.handle(null, program);
		resLines[1].push(new EndInstruction());
		console.log(resLines);
		this.resolve(resLines);
		return this.serialize(resLines);
	}

	protected resolve(resLines: TValueInstructions) {
		let i = 0;
		for (const line of resLines[1]) {
			line.resolve(i);
			if (!line.hidden) i++;
		}
	}

	protected serialize(resLines: TValueInstructions) {
		const [_, lines] = resLines;
		console.log(lines);
		return lines.filter((l) => !l.hidden).join("\n");
	}

	protected parse(script: string) {
		return parseScript(script, { loc: true });
	}

	handle(scope: IScope, node: es.Node): TValueInstructions {
		const handler = this.handlers[node.type];
		if (!handler) throw Error("Missing handler for " + node.type);
		return handler(this, scope, node, null);
	}

	handleEvaluate(scope: IScope, node: es.Node): TValueInstructions {
		const [res, lines] = this.handle(scope, node);
		const [evaluated, evaluatedLines] = res.eval(scope);
		return [evaluated, [...lines, ...evaluatedLines]];
	}

	handleMany(
		scope: IScope,
		nodes: es.Node[],
		handler: typeof Compiler.prototype.handle = this.handle.bind(this)
	): TValueInstructions {
		const lines = [];
		for (const node of nodes) {
			const [_, nodeLines] = handler(scope, node);
			lines.push(...nodeLines);
		}
		return [null, lines];
	}
}
