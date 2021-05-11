import { Compiler } from "./Compiler";

const code = `

let i = 0
i++
i++
i++
i += i + i + i
`;

console.log(new Compiler().compile(code));
