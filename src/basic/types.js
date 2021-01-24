class Base {
  constructor(c) {
    this.c = c;
  }
  get() {
    throw Error("Not Implemented");
  }
  set() {
    throw Error("Not Implemented");
  }
  getMember() {
    throw Error("Not Implemented");
  }
  call() {
    throw Error("Not Implemented");
  }
  toString() {
    return this.get();
  }
  use() {
    return this.get();
  }
}

class Macro extends Base {
  use() {
    return this;
  }
}

class Literal extends Base {
  constructor(c, value) {
    super(c);
    this.value = value;
  }
  get() {
    const type = typeof this.value;
    if (type == "number" || type == "string") return JSON.stringify(this.value);
    return this.value ? "1" : "0";
  }
}

class Identifier extends Base {
  constructor(c, name) {
    super(c);
    this.name = name;
  }
  get() {
    return this.name;
  }
  set(value) {
    value = value.use();
    if (value instanceof Accumulator) {
      const codegen = this.c.codegen;
      const last = codegen.length - 1;
      codegen[last] = codegen[last].replace(value, this.get());
    } else if (value instanceof Macro || value instanceof MacroBlock) {
      this.c.hidden[this] = value;
    } else this.c.write("set", this, value);
  }
  call(...args) {
    for (let i in args) this.c.write(`set $param${i}`, this.c.handle(args[i]).use());
    this.c.write("set $addr", this.c.size() + 2);
    this.c.write("set @counter", this.use());
    return new Identifier(this.c, "$ret");
  }
}

class Accumulator extends Base {
  constructor(c) {
    super(c);
    this.i = this.c.accCount;
    c.accCount++;
  }
  get() {
    return `$acc${this.i}`;
  }
  use() {
    this.c.accCount--;
    return this.get();
  }
}

class MacroFunction extends Macro {
  constructor(c, fn) {
    super(c);
    this.fn = fn;
  }
  call(...args) {
    return this.fn(...args.map((arg) => this.c.handle(arg)));
  }
}

class MemoryIndex extends Identifier {
  constructor(c, block, i) {
    super(c, `memory:${block}@${i}`);
    this.block = block;
    this.i = i;
  }
  get() {
    return this.c.write("read", new Accumulator(this.c), this.block, this.i)[1];
  }
  set(value) {
    this.c.write("write", value, this.block, this.i);
  }
}

class BlockMember extends Identifier {
  constructor(c, block, name) {
    super(c, `block:${block}@${name}`);
    this.block = block;
    this.name = "@" + name;
  }
  get() {
    return this.c.write("sensor", new Accumulator(this.c), this.block, this.name)[1];
  }
  set() {
    this.c.write("control", this.name, this.block, this.name);
  }
}

class Block extends Identifier {
  constructor(c, name) {
    super(c, name);
    this.members = {
      print: (...args) => {
        for (let arg of args) c.write("print", arg);
        this.members.printFlush.call();
      },
      read: (i) => c.write("read", new Accumulator(c), this, i)[1],
      write: (i, value) => c.write("write", value, this, i),
      printFlush: () => c.write("printflush", this),
      drawFlush: () => c.write("drawflush", this),
      sensor: (name) => c.write("sensor", new Accumulator(c), this, name)[1],
      control: (name, ...args) => c.write("control", name, this, ...args),
      radar: (target1, target2, target3, order, sort) => c.write("radar", target1, target2, target3, sort, this, order, new Accumulator(c))[7],
      shoot: (x, y, shoot) => this.members.control.call("@shoot", x, y, shoot),
      shootP: (unit, shoot) => this.members.control.call("@shootp", unit, shoot),
    };
    for (let key in this.members) this.members[key] = new MacroFunction(c, this.members[key]);
  }
  getMember(property, computed) {
    if (computed) return new MemoryIndex(this.c, this, property);
    const member = this.members[property];
    if (member) return member;
    return new BlockMember(this.c, this, property);
  }
}

class MacroBlock extends Block {
  use() {
    return this;
  }
}

module.exports = {
  Base,
  Macro,
  Literal,
  Identifier,
  Accumulator,
  Block,
  BlockMember,
  MacroBlock,
  MemoryIndex,
  MacroFunction,
};
