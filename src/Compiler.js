const { parseScript } = require("esprima");

class Compiler {
  constructor(instructions) {
    this.instructions = instructions;
    this.codegen = [];
    this.start = { line: "?", column: "?" };
    this.end = { line: "?", column: "?" };
    instructions.init(this);
  }
  handle(node) {
    const handler = this.instructions[node.type];
    this.start = node.loc.start;
    this.end = node.loc.end;
    if (handler) return handler(this, node);
    throw new Error(`${node.type} is not supported`);
  }
  compile(src) {
    try {
      const node = parseScript(src, { loc: true });
      this.handle(node);
    } catch (error) {
      throw { error, start: this.start, end: this.end };
    }
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
