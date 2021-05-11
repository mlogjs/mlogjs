import { Compiler } from "./Compiler";

const code = `
const a = function (a,b,c) {
    return a + b + c
}
a(1,2,3)
`;

console.log(new Compiler().compile(code));
