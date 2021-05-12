import { Compiler } from "./Compiler";

const code = `
const a = {
    hello: 1
}
let b = a["hello"]
`;

console.log(new Compiler().compile(code));
