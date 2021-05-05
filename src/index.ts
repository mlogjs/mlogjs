import {Compiler} from "./lib"

const code = `
const a = 1 / 6
const b = 2
const e = a + b + 3 + "asdf"
let asdf = e
`

console.log(new Compiler().compile(code))

