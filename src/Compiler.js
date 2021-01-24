const { parseScript } = require("esprima");

class Compiler {
  constructor(instructions) {
    this.instructions = instructions;
    this.codegen = [];
    instructions.init(this);
  }
  handle(node) {
    const handler = this.instructions[node.type];
    let out;
    if (handler) out = handler(this, node);
    return out;
  }
  compile(src) {
    const node = parseScript(src);
    this.handle(node);
    this.write("end");
  }
  writeAt(i, ...args) {
    this.codegen[i] = args.map((arg) => arg.toString()).join(" ");
    return args;
  }
  write(...args) {
    return this.writeAt(this.size(), ...args);
  }
  size(...args) {
    if (!args[0]) return this.codegen.length;
    this.write(...args);
    return this.codegen.length - 1;
  }
}

module.exports = Compiler;
