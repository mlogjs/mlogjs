import { Compiler } from "./core";

const code = `
let a = 2 + 123
`;

console.log(new Compiler().compile(code));
