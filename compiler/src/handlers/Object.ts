import { CompilerError } from "../CompilerError";
import {
  es,
  IInstruction,
  IValue,
  THandler,
  TValueInstructions,
} from "../types";
import {
  DestructuringValue,
  IObjectValueData,
  LiteralValue,
  ObjectValue,
  SenseableValue,
  TDestructuringMembers,
} from "../values";

export const ObjectExpression: THandler = (
  c,
  scope,
  node: es.ObjectExpression
) => {
  const data: IObjectValueData = {};
  const inst = [];
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
    const [member, memberInst] = c.handleEval(scope, value);

    data[index] = member;
    inst.push(...memberInst);
  }
  return [new ObjectValue(data), inst];
};

export const ArrayExpression: THandler = (
  c,
  scope,
  node: es.ArrayExpression
) => {
  const items: (IValue | undefined)[] = [];
  const inst: IInstruction[] = [];
  node.elements.forEach(element => {
    const [value, valueInst] = element
      ? c.handleEval(scope, element)
      : [undefined, []];
    items.push(value);
    inst.push(...valueInst);
  });
  return [ObjectValue.fromArray(items), inst];
};

export const MemberExpression: THandler = (
  c,
  scope,
  node: es.MemberExpression,
  out
) => {
  const [prop, propInst] = node.computed
    ? c.handleConsume(scope, node.property)
    : [new LiteralValue((node.property as es.Identifier).name), []];

  if (!out) {
    const [obj, objInst] = c.handleConsume(scope, node.object);

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

  const [got, gotInst] = obj.get(scope, prop, temp);
  return [got, [...objInst, ...propInst, ...gotInst]];
};

export const ArrayPattern: THandler = (c, scope, node: es.ArrayPattern) => {
  const inst: IInstruction[] = [];
  const members: TDestructuringMembers = new Map();
  for (let i = 0; i < node.elements.length; i++) {
    const element = node.elements[i];
    if (!element) continue;
    const [value, valueInst] = c.handle(scope, element);
    if (!value)
      throw new CompilerError(
        "Destructuring element must resolve to a value",
        element
      );

    inst.push(...valueInst);
    members.set(new LiteralValue(i), {
      value,
      handler(get) {
        return c.handle(scope, element, () => {
          const inst = get();
          // assigns the output to the target value
          inst[1].push(...value["="](scope, inst[0])[1]);
          return inst;
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

    const { key } = prop;
    const keyInst: TValueInstructions =
      !prop.computed && key.type === "Identifier"
        ? [new LiteralValue(key.name), []]
        : c.handleConsume(scope, prop.key);
    inst.push(...keyInst[1]);

    const [value, valueInst] = c.handle(scope, prop.value);

    if (!value)
      throw new CompilerError(
        "Destructuring member must resolve to a value",
        prop.value
      );

    inst.push(...valueInst);

    members.set(keyInst[0], {
      value,
      handler(get) {
        return c.handle(scope, prop, () => {
          const inst = get();
          // assigns the output to the target value
          inst[1].push(...value["="](scope, inst[0])[1]);
          return inst;
        });
      },
    });
  }
  return [new DestructuringValue(members), inst];
};
