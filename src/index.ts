import Compiler from "./Compiler"

const code = `
let a = 10
`

console.log(new Compiler().compile(code))