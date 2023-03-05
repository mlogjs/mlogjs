import { CompilerError } from "../CompilerError";
import { es, IInstruction, IValue, THandler } from "../types";
import { extractDestrucuringOut, pipeInsts } from "../utils";
import {
  AssignmentValue,
  DestructuringValue,
  IObjectValueData,
  LazyValue,
  LiteralValue,
  ObjectValue,
  SenseableValue,
  TDestructuringMembers,
} from "../values";

export const ObjectExpression: THandler = (
  c,
  scope,
  node: es.ObjectExpression,
  out
) => {
  const data: IObjectValueData = {};
  const inst: IInstruction[] = [];
  for (const prop of node.properties) {
    if (prop.type === "SpreadElement")
      throw new CompilerError("Cannot handle spread element", prop);
    if (prop.computed)
      throw new CompilerError("Cannot handle computed property.", prop);
    const { key } = prop;
    const value = prop.type === "ObjectProperty" ? prop.value : prop;
    let index: string;
    if (key.type === "Identifier") {
      index = key.name;
    } else if (key.type === "StringLiteral" || key.type === "NumericLiteral") {
      index = `${key.value}`;
    } else {
      throw new CompilerError(`Unsupported object key type: ${key.type}`, key);
    }

    const memberOut = extractDestrucuringOut(out, index);
    const member = pipeInsts(c.handleEval(scope, value, memberOut), inst);

    data[index] = member;
  }
  return [new ObjectValue(data), inst];
};

export const ArrayExpression: THandler = (
  c,
  scope,
  node: es.ArrayExpression,
  out
) => {
  const items: (IValue | undefined)[] = [];
  const inst: IInstruction[] = [];
  node.elements.forEach((element, i) => {
    if (!element) {
      items.push(undefined);
      return;
    }
    const value = pipeInsts(
      c.handleEval(scope, element, extractDestrucuringOut(out, i)),
      inst
    );
    items.push(value);
  });
  return [ObjectValue.fromArray(items), inst];
};

export const MemberExpression: THandler = (
  c,
  scope,
  node: es.MemberExpression,
  out,
  optional = false
) => {
  const [prop, propInst] = node.computed
    ? c.handleEval(scope, node.property)
    : [new LiteralValue((node.property as es.Identifier).name), []];

  if (!out) {
    const [obj, objInst] = c.handleEval(scope, node.object);

    if (optional && obj instanceof LiteralValue && obj.data === null)
      return [obj, [...objInst, ...propInst]];

    const [got, gotInst] = obj.get(scope, prop);
    return [got, [...objInst, ...propInst, ...gotInst]];
  }

  const temp = SenseableValue.out(scope, out);

  const objOut = new DestructuringValue(
    new Map([
      [
        prop,
        {
          value: temp,
          // a direct assignment should NOT happen
          handler: () => {
            throw new CompilerError("Unexpected destructuring assignment");
          },
        },
      ],
    ])
  );

  const [obj, objInst] = c.handleEval(scope, node.object, objOut);

  if (optional && obj instanceof LiteralValue && obj.data === null)
    return [obj, [...objInst, ...propInst]];

  const [got, gotInst] = obj.get(scope, prop, temp);
  return [got, [...objInst, ...propInst, ...gotInst]];
};

export const ArrayPattern: THandler = (c, scope, node: es.ArrayPattern) => {
  const inst: IInstruction[] = [];
  const members: TDestructuringMembers = new Map();
  for (let i = 0; i < node.elements.length; i++) {
    const element = node.elements[i];
    if (!element) continue;
    const value = pipeInsts(c.handleValue(scope, element), inst);
    const hasDefault = value instanceof AssignmentValue;

    members.set(new LiteralValue(i), {
      value: value.toOut(),
      handler(get, propExists, scope) {
        return c.handle(scope, element, () => {
          if (propExists() || !hasDefault) {
            const inst = get();
            // assigns the output to the target value
            pipeInsts(value["="](scope, inst[0]), inst[1]);
            return inst;
          }
          return value["="](scope, new LiteralValue(null));
        });
      },
    });
  }
  return [new DestructuringValue(members), inst];
};

export const ObjectPattern: THandler = (c, scope, node: es.ObjectPattern) => {
  const inst: IInstruction[] = [];
  const members: TDestructuringMembers = new Map();
  for (const prop of node.properties) {
    if (prop.type === "RestElement")
      throw new CompilerError("The rest operator is not supported");

    if (!prop) continue;

    const propKey = prop.key;
    const [key, keyInst] =
      propKey.type === "Identifier" && !prop.computed
        ? [new LiteralValue(propKey.name), []]
        : c.handleEval(scope, propKey);

    const value = pipeInsts(c.handleValue(scope, prop.value), inst);
    const hasDefault = value instanceof AssignmentValue;

    members.set(key, {
      value: value.toOut(),
      handler(get, propExists, scope) {
        return c.handle(scope, prop, () => {
          const inst = keyInst;
          if (propExists() || !hasDefault) {
            const input = pipeInsts(get(), inst);
            // assigns the output to the target value
            const output = pipeInsts(value["="](scope, input), inst);
            return [output, inst];
          }

          const result = pipeInsts(
            value["="](scope, new LiteralValue(null)),
            inst
          );
          return [result, inst];
        });
      },
    });
  }
  return [new DestructuringValue(members), inst];
};

// the mlog runtime already does this check for us
export const OptionalMemberExpression: THandler = (
  c,
  scope,
  node: es.OptionalMemberExpression,
  out
) => MemberExpression(c, scope, node, out, true);

export const AssignmentPattern: THandler<IValue> = (
  c,
  scope,
  node: es.AssignmentPattern
) => {
  const [left, inst] = c.handleValue(scope, node.left);
  const right = new LazyValue((_, out) => c.handleEval(scope, node.right, out));

  return [new AssignmentValue(left, right), inst];
};
