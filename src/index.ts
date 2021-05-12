import { Compiler } from "./Compiler";

const code = `
const a = function (a,b,c) {
    return a + b + c
}
const b = a + 1
`;

console.log(new Compiler().compile(code));
