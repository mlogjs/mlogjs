const basic = require("./basic");
const Compiler = require("./Compiler");

module.exports = (src) => {
  const compiler = new Compiler(basic);
  compiler.compile(src);
  return { out: compiler.codegen.join("\n") };
};
