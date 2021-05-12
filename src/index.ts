import { Compiler } from "./Compiler";

const code = `
const a = (a,b,c) => a + b + c
let b = a(1,2,3)
`;

console.log(new Compiler().compile(code));
