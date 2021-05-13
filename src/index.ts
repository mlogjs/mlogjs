import { Compiler } from "./Compiler";

const code = `
const a = (a,b,c) => a + b + c
let b = 3
let c = a(1,2,b)
`;

console.log(new Compiler().compile(code));
