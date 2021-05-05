import { parseScript } from "esprima";
import * as es from "estree";
import { LiteralValue, IScope, TResLines, Scope, IValue } from ".";
import { BinaryOperatorMap } from "./operators";

export class Compiler {
	protected stackName?: string;
	protected usingStack: boolean;

	constructor(stackName?: string) {
		this.usingStack = !!stackName;
		this.stackName = stackName;
	}

	compile(script: string): string {
		const program = this.parse(script);
		return this.serialize(this.handle(program, Scope.createRoot({})));
	}

	protected serialize(resLines: TResLines) {
		const [_, lines] = resLines;
		console.log(lines);
		return lines.map((l) => l.join(" ")).join("\n");
	}

	protected parse(script: string) {
		return parseScript(script);
	}

	protected handle(node: es.Node, scope: IScope): TResLines {
		const handler = this[node.type];
		if (!handler) throw Error("Missing handler for " + node.type);
		return this[node.type](node, scope);
	}

	protected handleMany(
		nodes: es.Node[],
		scope: IScope,
		handler: typeof Compiler.prototype.handle = this.handle.bind(this)
	): TResLines {
		const lines = [];
		for (const node of nodes) {
			const [_, nodeLines] = handler(node, scope);
			lines.push(...nodeLines);
		}
		return [null, lines];
	}

	protected Program(node: es.Program, scope: IScope) {
		return this.handleMany(node.body, scope);
	}

	protected VariableDeclaration(node: es.VariableDeclaration, scope: IScope) {
		return this.handleMany(node.declarations, scope, (child, scope) =>
			this.VariableDeclarator(child as es.VariableDeclarator, scope, node.kind)
		);
	}

	protected VariableDeclarator(
		node: es.VariableDeclarator,
		scope: IScope,
		kind: "let" | "var" | "const" = "let"
	): TResLines {
		const resLines = this.handle(node.init, scope);
		const { name } = node.id as es.Identifier;
		const [init] = resLines
		if (kind === "const" && init instanceof LiteralValue) {
			console.log("doing something with literal");
			scope.set(name, init);
			return [init, []];
		}
		const value = scope.createValue(name)
		if (kind === "const") value.constant = true
		return value.assignFromResLines(scope, resLines);
	}

	protected Literal(node: es.Literal): TResLines {
		let { value } = node;
		value = typeof value === "string" ? value : Number(value);
		return [new LiteralValue(value), []];
	}

	protected Identifier(node: es.Identifier, scope: IScope): TResLines {
		return [scope.get(node.name), []];
	}

	protected BinaryExpression(node: es.BinaryExpression, scope: IScope): TResLines {
		const [left, leftLines] = this.handle(node.left, scope)
		const [right, rightLines] = this.handle(node.right, scope)
		const [op, opLines] = left.binaryOperation(node.operator, scope, right)
		const res =  [op, [...leftLines, ...rightLines, ...opLines]] as TResLines
		console.log(res)
		return res
	}

	protected LogicalExpression(node: es.LogicalExpression, scope: IScope): TResLines {
		const [left, leftLines] = this.handle(node.left, scope)
		const [right, rightLines] = this.handle(node.right, scope)
		const [op, opLines] = left.logicalOperation(node.operator, scope, right)
		return [op, [...leftLines, ...rightLines, ...opLines]]
	}

	protected AssignmentExpression(node: es.AssignmentExpression, scope: IScope): TResLines {
		const [left, leftLines] = this.handle(node.left, scope)
		const [right, rightLines] = this.handle(node.right, scope)
		const [op, opLines] = left.assignmentOperation(node.operator, scope, right)
		return [op, [...leftLines, ...rightLines, ...opLines]]
	}

	protected UpdateExpression(node: es.UpdateExpression, scope: IScope): TResLines {
		const [arg, argLines] = this.handle(node.argument, scope)
		const [op, opLines] = arg.updateOperation(node.operator, scope)
		return [op, [...argLines, ...opLines]]
	}

	protected UnaryExpression(node: es.UnaryExpression, scope: IScope): TResLines {
		const [arg, argLines] = this.handle(node.argument, scope)
		const [op, opLines] = arg.unaryOperation(node.operator, scope)
		return [op, [...argLines, ...opLines]]
	}

	protected ExpressionStatement(node: es.ExpressionStatement, scope: IScope): TResLines {
		return this.handle(node.expression, scope)
	}
}
