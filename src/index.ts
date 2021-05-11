import { Compiler } from "./Compiler";

const code = `
function a (a,b,c) {
    return a + b + c
}
let b = a(1,2,3)
`;

console.log(new Compiler().compile(code));
