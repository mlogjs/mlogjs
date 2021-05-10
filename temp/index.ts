import { Compiler } from "./core";

const code = `
while (1) {
    let a = 2 + 123
}
`;

console.log(new Compiler().compile(code));
