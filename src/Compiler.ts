import { parseScript } from "esprima";
import { Node, Program, VariableDeclaration, VariableDeclarator} from "estree";



export default class Compiler {
	stackName?: string;

	constructor(stackName?: string) {
		this.stackName = stackName;
	}

	parse(script: string) {
		return parseScript(script);
	}

    compile(script: string) {
        const program = this.parse(script)
        const codegen = this.handle(program, {})
        return codegen.join("\n")
    }

    handle(node: Node) {
        return this[node.type](node)
    }

    Program(program: Program) {
        const codegen = []
        for (const node of program.body) codegen.push(...this.handle(node))
        return codegen
    }

    VariableDeclaration(decl: VariableDeclaration) {
        
    }
    VariableDeclarator(decl: VariableDeclarator) {

    }
}
 