
import { parseScript } from "esprima";
import * as es from "estree";
import { IScope, Scope } from ".";
import { EJumpKind, EndLine, AddressLine, JumpLine, TResLines } from "../line";
import { LiteralValue, TLiteral } from "../value";

export class Compiler {
	protected stackName?: string;
	protected usingStack: boolean;

	constructor(stackName?: string) {
		this.usingStack = !!stackName;
		this.stackName = stackName;
	}

	compile(script: string): string {
		const program = this.parse(script);
		const resLines = this.handle(null, program)
		resLines[1].push(new EndLine())
		this.processAddressLines(resLines)
		return this.serialize(resLines);
	}

	protected processAddressLines(resLines: TResLines) {
		let i = 0
		for (const line of resLines[1]) {
			line.processAddressLine(i)
			if (!line.hidden) i++
		}
	}

	protected serialize(resLines: TResLines) {
		const [_, lines] = resLines;
		console.log(lines);
		return lines.filter(l => !l.hidden).join("\n");
	}

	protected parse(script: string) {
		return parseScript(script, { loc: true });
	}

	protected handle(scope: IScope, node: es.Node): TResLines {
		const handler = this[node.type];
		if (!handler) throw Error("Missing handler for " + node.type);
		return this[node.type](scope, node);
	}

	protected handleEvaluate(scope: IScope, node: es.Node): TResLines {
		const [res, lines] = this.handle(scope, node)
		const [evaluated, evaluatedLines] = res.evaluate(scope)
		return [evaluated, [...lines, ...evaluatedLines]]
	}

	protected handleMany(
		scope: IScope,
		nodes: es.Node[],
		handler: typeof Compiler.prototype.handle = this.handle.bind(this)
	): TResLines {
		const lines = [];
		for (const node of nodes) {
			const [_, nodeLines] = handler(scope, node);
			lines.push(...nodeLines);
		}
		return [null, lines];
	}

	protected Program(_: IScope, node: es.Program) {
		return this.handleMany(Scope.createRoot({}), node.body);
	}

	protected VariableDeclaration(scope: IScope, node: es.VariableDeclaration) {
		return this.handleMany(scope, node.declarations, (scope, child) =>
			this.VariableDeclarator(scope, child as es.VariableDeclarator, node.kind)
		);
	}

	protected VariableDeclarator(
		scope: IScope,
		node: es.VariableDeclarator,
		kind: "let" | "var" | "const" = "let"
	): TResLines {
		const resLines = this.handle(scope, node.init);
		const { name } = node.id as es.Identifier;
		const [init] = resLines;
		if (kind === "const" && init.constant) {
			scope.set(name, init);
			return [init, []];
		} else {
			const { line, column } = node.loc.start;
			const value = scope.createValue(name, `${name}:${line}:${column}`);
			const valueResLines = value.assignFromResLines(scope, resLines);
			if (kind === "const") value.constant = true;
			return valueResLines;
		}
	}

	protected Literal(scope: IScope, node: es.Literal): TResLines {
		const { value } = node;
		if (value === null || typeof value === "string" || typeof value === "number") {
			return [new LiteralValue(scope, value as TLiteral), []];
		}
		if (typeof value === "boolean") {
			return [new LiteralValue(scope, +value), []];
		}
		throw Error("Cannot create literal " + typeof value);
	}

	protected Identifier(scope: IScope, node: es.Identifier): TResLines {
		return [scope.get(node.name), []];
	}

	protected BinaryExpression(scope: IScope, node: es.BinaryExpression): TResLines {
		const [left, leftLines] = this.handleEvaluate(scope, node.left);
		const [right, rightLines] = this.handleEvaluate(scope, node.right);
		const [op, opLines] = left.binaryOperation(node.operator, scope, right);
		const res = [op, [...leftLines, ...rightLines, ...opLines]] as TResLines;
		return res;
	}

	protected LogicalExpression(scope: IScope, node: es.LogicalExpression): TResLines {
		const [left, leftLines] = this.handleEvaluate(scope, node.left);
		const [right, rightLines] = this.handleEvaluate(scope, node.right);
		const [op, opLines] = left.logicalOperation(node.operator, scope, right);
		return [op, [...leftLines, ...rightLines, ...opLines]];
	}

	protected AssignmentExpression(scope: IScope, node: es.AssignmentExpression): TResLines {
		const [left, leftLines] = this.handleEvaluate(scope, node.left);
		const [right, rightLines] = this.handleEvaluate(scope, node.right);
		const [op, opLines] = left.assignmentOperation(node.operator, scope, right);
		return [op, [...leftLines, ...rightLines, ...opLines]];
	}

	protected UpdateExpression(scope: IScope, node: es.UpdateExpression): TResLines {
		const [arg, argLines] = this.handleEvaluate(scope, node.argument);
		const [op, opLines] = arg.updateOperation(node.operator, scope);
		return [op, [...argLines, ...opLines]];
	}

	protected UnaryExpression(scope: IScope, node: es.UnaryExpression): TResLines {
		const [arg, argLines] = this.handleEvaluate(scope, node.argument);
		const [op, opLines] = arg.unaryOperation(node.operator, scope);
		return [op, [...argLines, ...opLines]];
	}

	protected ExpressionStatement(scope: IScope, node: es.ExpressionStatement): TResLines {
		return this.handle(scope, node.expression);
	}

	protected BlockStatement(scope: IScope, node: es.BlockStatement): TResLines {
		return this.handleMany(scope.extend(), node.body);
	}

	protected IfStatement(scope: IScope, node: es.IfStatement): TResLines {
		const lines = []
		const [test, testLines] = this.handleEvaluate(scope, node.test);
		if (test instanceof LiteralValue) {
			if (test.data) lines.push(...this.handle(scope, node.consequent)[1]);
			else lines.push(...this.handle(scope, node.alternate)[1])
			return [null, lines];
		}
		const endIfAddr = new LiteralValue(scope, null)
		lines.push(
			...testLines,
			new JumpLine(endIfAddr, EJumpKind.NotEqual, test, new LiteralValue(scope, 0)),
			...this.handle(scope, node.consequent)[1],
			new AddressLine(endIfAddr)
		)
		const endElseAddr = new LiteralValue(scope, null)
		if (node.alternate) lines.push(
			new JumpLine(endElseAddr, EJumpKind.Always),
			new AddressLine(endIfAddr),
			...this.handle(scope, node.alternate)[1],
			new AddressLine(endElseAddr)
			)
		return [null, lines]
	}
}
