import { CompilerError } from "../CompilerError";
import { es, IInstruction, IValue, THandler } from "../types";
import { IObjectValueData, LiteralValue, ObjectValue } from "../values";
import { ValueOwner } from "../values/ValueOwner";

export const ObjectExpression: THandler = (
  c,
  scope,
  node: es.ObjectExpression
) => {
  const data: IObjectValueData = {};
  const inst = [];
  for (const prop of node.properties) {
    if (prop.type === "SpreadElement")
      throw new CompilerError("Cannot handle spread element", [prop]);
    if (prop.computed)
      throw new CompilerError("Cannot handle computed property.", [prop]);
    const { key } = prop;
    const value = prop.type === "ObjectProperty" ? prop.value : prop;
    let index: string;
    if (key.type === "Identifier") {
      index = key.name;
    } else if (key.type === "StringLiteral" || key.type === "NumericLiteral") {
      index = `${key.value}`;
    } else {
      throw new CompilerError(`Unsupported object key type: ${key.type}`, [
        key,
      ]);
    }
    const [member, memberInst] = c.handleEval(scope, value);
    const owner = new ValueOwner({
      scope,
      constant: true,
      value: member,
    });
    data[index] = owner.value;
    inst.push(...memberInst);
  }
  return [new ObjectValue(scope, data), inst];
};

export const ArrayExpression: THandler = (
  c,
  scope,
  node: es.ArrayExpression
) => {
  const items: IValue[] = [];
  const inst: IInstruction[] = [];
  node.elements.forEach(element => {
    if (!element) return;
    const [value, valueInst] = c.handleEval(scope, element);
    items.push(value);
    inst.push(...valueInst);
  });
  return [ObjectValue.fromArray(scope, items), inst];
};

export const MemberExpression: THandler = (
  c,
  scope,
  node: es.MemberExpression
) => {
  const [obj, objInst] = c.handleConsume(scope, node.object);

  const [prop, propInst] = node.computed
    ? c.handleConsume(scope, node.property)
    : [new LiteralValue(scope, (node.property as es.Identifier).name), []];

  const [got, gotInst] = obj.get(scope, prop);
  return [got, [...objInst, ...propInst, ...gotInst]];
};
