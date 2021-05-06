import { Compiler } from "./core";

const code = `
const a = 1
if (a) {
    let b = 123
} else if (a) {
    let b = 321
}
`;

console.log(new Compiler().compile(code));
