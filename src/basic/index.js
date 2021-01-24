const { Literal, Identifier, Accumulator, Block } = require("./types");
const ops = require("./ops");
const macros = require("./macros");

const createContainerHandler = (key) => (c, node) => {
  for (let child of node[key]) c.handle(child);
};

const BinaryExpression = (c, { left, operator, right }) => {
  left = c.handle(left);
  right = c.handle(right);
  if (left instanceof Literal && right instanceof Literal) return new Literal(c, ops[operator][1](left.value, right.value));
  return c.write("op", ops[operator][0], new Accumulator(c), left.use(), right.use())[2];
};

const FunctionExpression = (c, { params, body }) => {
  c.params.push(params.map((id) => id.name));
  const head = c.size();
  c.size("unresolved function skip");
  c.handle(body);
  c.write("set @counter $addr");
  c.writeAt(head, "jump", c.size(), "always");
  c.params.pop();
  return new Literal(c, head + 1);
};

const CallExpression = (c, { callee, arguments }) => c.handle(callee).call(...arguments);

module.exports = {
  init(c) {
    c.accCount = 0;
    c.params = [];
    c.breaks = [];
    c.hidden = { ...macros(c) };
  },
  FunctionExpression,
  BinaryExpression,
  CallExpression,
  NewExpression: CallExpression,
  LogicalExpression: BinaryExpression,
  ArrowFunctionExpression: FunctionExpression,
  FunctionDeclaration: (c, { id, params, body }) => c.handle(id).set(FunctionExpression(c, { params, body })),
  Literal: (c, { value }) => new Literal(c, value),
  VariableDeclarator: (c, { id, init }) => c.handle(id).set(c.handle(init)),
  Program: createContainerHandler("body"),
  BlockStatement: createContainerHandler("body"),
  VariableDeclaration: createContainerHandler("declarations"),
  ReturnStatement: (c, { argument }) => c.write("set $ret", c.handle(argument).use()),
  BreakStatement: (c) => c.breaks.slice(-1)[0].push(c.size("unresolved break")),
  ExpressionStatement(c, { expression, directive }) {
    if (directive) c.write(directive);
    return c.handle(expression);
  },
  Identifier(c, { name }) {
    const paramI = (c.params.slice(-1)[0] || []).indexOf(name);
    if (c.hidden[name]) return c.hidden[name];
    if (paramI >= 0) return new Identifier(c, "$param" + paramI);
    return new Block(c, name);
  },
  UnaryExpression(c, { operator, argument }) {
    argument = c.handle(argument);
    if (argument instanceof Literal) return new Literal(c, ops[operator][1](argument.value));
    return c.write("op", ops[operator][0], new Accumulator(c), argument.use())[2];
  },
  UpdateExpression(c, { argument, operator }) {
    argument = c.handle(argument);
    return c.write("op", ops[operator][0], argument, argument, 1);
  },
  AssignmentExpression: (c, { left, operator, right }) => {
    left = c.handle(left);
    right = c.handle(right);
    if (operator == "=") return left.set(right);
    return c.write("op", ops[operator.slice(0, -1)][0], left, left.use(), right.use())[2];
  },
  IfStatement(c, { test, consequent, alternate }) {
    test = c.handle(test).use();
    const start = c.size("unresolved jump");
    let end;
    c.handle(consequent);
    if (alternate) end = c.size("unresolved jump");
    c.writeAt(start, "jump", c.size(), "equal", test, 0);
    if (alternate) {
      c.handle(alternate);
      c.writeAt(end, "jump", c.size(), "always");
    }
  },
  WhileStatement(c, { test, body }) {
    c.breaks.push([]);
    const head = c.size();
    test = c.handle(test).use();
    const start = c.size("unresolved jump");
    c.handle(body);
    c.write("jump", head, "always");
    const end = c.size();
    c.writeAt(start, "jump", end, "equal", test, 0);
    for (let i of c.breaks.pop()) c.writeAt(i, "jump", end, "always");
  },
  ForStatement(c, { init, test, update, body }) {
    c.breaks.push([]);
    c.handle(init);
    const head = c.size();
    test = c.handle(test).use();
    const start = c.size("unresolved jump");
    c.handle(body);
    c.handle(update);
    c.write("jump", head, "always");
    const end = c.size();
    c.writeAt(start, "jump", end, "equal", test, 0);
    for (let i of c.breaks.pop()) c.writeAt(i, "jump", end, "always");
    c.breaks.pop();
  },

  MemberExpression(c, { object, property, computed }) {
    if (computed) return c.handle(object).getMember(c.handle(property), computed);
    return c.handle(object).getMember(new Identifier(c, property.name), computed);
  },
  TemplateElement: (c, { value }) => value.raw,
  TemplateLiteral: (c, { quasis, expressions }) => c.write(expressions.map((e, i) => c.handle(quasis[i]) + c.handle(e).use()).join("") + c.handle(quasis.slice(-1)[0])),
};
