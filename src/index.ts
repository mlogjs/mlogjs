import {Compiler} from "./Compiler"
const compiler = new Compiler()
export const compile = (script: string) => compiler.compile(script)