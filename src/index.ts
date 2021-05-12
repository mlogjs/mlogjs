import { Compiler } from "./Compiler";

const code = `
const a = {
    $eval: () => {}
}
let b = a()
`;

console.log(new Compiler().compile(code));
