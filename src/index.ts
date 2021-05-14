import { Compiler } from "./Compiler";
import {readFileSync} from "fs"

const code = readFileSync("samples/templates.js", {encoding: "utf8"})

console.log(new Compiler().compile(code))