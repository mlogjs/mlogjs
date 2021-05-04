import { parseScript } from "esprima";
import * as es from "estree";
import Scope from "./Scope";
import { TResLines } from "./types";
import Literal from "./value/Literal";
import Value from "./value/Value";

export default class Compiler {
	protected stackName?: string;
	protected usingStack: boolean;

	constructor(stackName?: string) {
		this.usingStack = !!stackName;
		this.stackName = stackName;
	}

    compile(script: string) {
		const program = this.parse(script);
		const lines = this.handle(program, Scope.createRoot({}));
		return lines.join("\n");
	}

	protected parse(script: string) {
		return parseScript(script);
	}

    protected handleContainer(key: string, node: es.Node, scope: Scope): TResLines{
        const lines = []
        for (const child of node[key]) {
            const [_, lines] = this.handle(child, scope)
            lines.push(...lines)
        }
        return [null, lines]
    }

	protected handle(node: es.Node, scope: Scope): TResLines {
		return this[node.type](node, scope);
	}

	protected Program(node: es.Program, scope: Scope) {
		return this.handleContainer("body", node, scope)
	}

	protected VariableDeclaration(node: es.VariableDeclaration, scope: Scope) {
        
		return [
			null,
			node.declarations.map((n) => this.VariableDeclarator(n, scope, node.kind)).flat(),
		];
	}

	protected VariableDeclarator(
		node: es.VariableDeclarator,
		scope: Scope,
		kind: "let" | "var" | "const" = "let"
	): TResLines {
		const [init] = this.handle(node.init, scope);
		const { name } = node.id as es.Identifier;
		if (kind === "const" && init instanceof Literal) {
			scope.set(name, init);
			return [init, []];
		}
		return scope.createVariable(name).assign(scope, init);
	}

	protected Literal(node: es.Literal): TResLines {
		let { value } = node;
		value = typeof value === "string" ? value : Number(value);
		return [new Literal(value), []];
	}

	protected Identifer(node: es.Identifier, scope: Scope): TResLines {
		return [scope.get(node.name), []];
	}
}
