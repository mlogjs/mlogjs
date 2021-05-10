import { Compiler } from "./Compiler";

const code = `
const hello = function (a,b,c) {

}
function hello() {

}

`;

console.log(new Compiler().compile(code));
