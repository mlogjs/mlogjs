const { Identifier, Accumulator, MacroFunction, MacroBlock } = require("./types");

const macros = (c) => {
  const members = {
    Block: ({ value }) => new MacroBlock(c, value),
    Bank: ({ value }) => new MacroBlock(c, "bank" + value),
    Cell: ({ value }) => new MacroBlock(c, "cell" + value),
    Display: ({ value }) => new MacroBlock(c, "display" + value),
    Switch: ({ value }) => new MacroBlock(c, "switch" + value),
    Message: ({ value }) => new MacroBlock(c, "message" + value),
    // printing
    print: (...args) => args.forEach((arg) => c.write("print", arg)),
    printFlush: (block) => c.write("printflush", block),
    // drawing
    draw: (...args) => c.write("draw", ...args.map((arg) => arg.value)),
    drawFlush: (block) => c.write("drawflush", block),
    drawClear: (r = 0, g = 0, b = 0) => c.write("draw clear", r, g, b),
    drawColor: (r = 0, g = 0, b = 0, a = 255) => c.write("draw color", r, g, b, a),
    drawStoke: (width = 1) => c.write("draw stroke", width),
    drawLine: (x = 0, y = 0, x2 = 0, y2 = 0) => c.write("draw line", x, y, x2, y2),
    drawRect: (x, y, width, height) => c.write("draw rect", x, y, width, height),
    drawLineRect: (x, y, width, height) => c.write("draw lineRect", x, y, width, height),
    drawPoly: (x = 0, y = 0, sides = 0, radius = 0, rotation = 0) =>
      c.write("draw poly", x, y, sides, radius, rotation),
    drawLinePoly: (x = 0, y = 0, sides = 0, radius = 0, rotation = 0) =>
      c.write("draw linePoly", x, y, sides, radius, rotation),
    drawTriangle: (x = 0, y = 0, x2 = 0, y2 = 0, x3 = 0, y3 = 0) =>
      c.write("draw triangle", x, y, x2, y2, x3, y3),
    drawImage: (x = 0, y = 0, image = "", size = 32, rotation = 0) =>
      c.write("draw image", x, y, image, size, rotation),
    // memory
    read: (block, i) => c.write("read", new Accumulator(c), block, i)[1],
    write: (block, i, value) => c.write("write", value, block, i),
    // math
    atan2: (a = 0, b = 0) => c.write("op atan2", new Accumulator(c), a, b),
    dst: (n = 0) => c.write("op dst", new Accumulator(c), n)[1],
    noise: (n = 0) => c.write("op noise", new Accumulator(c), n)[1],
    abs: (n = 0) => c.write("op abs", new Accumulator(c), n)[1],
    log: (n = 0) => c.write("op log", new Accumulator(c), n)[1],
    log10: (n = 0) => c.write("op log10", new Accumulator(c), n)[1],
    sin: (n = 0) => c.write("op sin", new Accumulator(c), n)[1],
    cos: (n = 0) => c.write("op cos", new Accumulator(c), n)[1],
    tan: (n = 0) => c.write("op tan", new Accumulator(c), n)[1],
    floor: (n = 0) => c.write("op floor", new Accumulator(c), n)[1],
    ceil: (n = 0) => c.write("op ceil", new Accumulator(c), n)[1],
    sqrt: (n = 0) => c.write("op sqrt", new Accumulator(c), n)[1],
    rand: (n = 0) => c.write("op rand", new Accumulator(c), n)[1],
    // other
    sensor: (block, name) => c.write("sensor", new Accumulator(c), block, name)[1],
    control: (block, name, ...args) => c.write("control", name, block, ...args),
    radar: (block, target1, target2, target3, order, sort) =>
      c.write("radar", target1, target2, target3, sort, block, order, new Accumulator(c))[7],
    unitBind: (type) => c.write("ubind", type),
    unitControl: (name, ...args) => c.write("control", name, ...args),
    unitRadar: (target1, target2, target3, order, sort) =>
      c.write("radar", target1, target2, target3, sort, order, new Accumulator(c))[6],
  };
  for (let key in members) {
    const member = members[key];
    members[key] =
      typeof member == "function" ? new MacroFunction(c, member) : new Identifier(c, member);
  }
  return members;
};

module.exports = macros;
