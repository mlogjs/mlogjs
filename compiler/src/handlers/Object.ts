import { CompilerError } from "../CompilerError";
import {
  BinaryOperationInstruction,
  Block,
  BreakIfInstruction,
  BreakInstruction,
  LoadInstruction,
  StoreInstruction,
  ValueGetInstruction,
  ValueSetInstruction,
} from "../flow";
import { GlobalId, ImmutableId } from "../flow/id";
import { es, THandler } from "../types";
import { nullId } from "../utils";
import { IObjectValueData, LiteralValue, ObjectValue } from "../values";

export const ObjectExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.ObjectExpression,
) => {
  const data: IObjectValueData = {};
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
      index = String(key.value);
    } else {
      throw new CompilerError(`Unsupported object key type: ${key.type}`, key);
    }

    const member = c.handle(scope, cursor, value);
    if (prop.type !== "ObjectMethod" || prop.kind === "method") {
      data[index] = member;
    } /* else {
      if (!(data[index] instanceof ObjectGetSetEntry))
        data[index] = new ObjectGetSetEntry();
      const entry = data[index] as ObjectGetSetEntry;

      if (prop.kind === "get") {
        entry.getter = member;
      } else {
        entry.setter = member;
      }
    }
  } */
    // return [new ObjectValue(data), inst];
  }
  return c.registerValue(new ObjectValue(data));
};

export const ArrayExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.ArrayExpression,
) => {
  const items: ImmutableId[] = [];
  node.elements.forEach(element => {
    if (!element) {
      items.push(nullId);
      return;
    }
    const value = c.handle(scope, cursor, element);
    items.push(value);
  });

  return c.registerValue(ObjectValue.fromArray(c, items));
};

export const MemberExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.MemberExpression,
  optional: boolean = false,
) => {
  const object = c.handle(scope, cursor, node.object);
  const key = node.computed
    ? c.handle(scope, cursor, node.property)
    : c.registerValue(new LiteralValue((node.property as es.Identifier).name));

  const out = new ImmutableId();

  cursor.addInstruction(
    new ValueGetInstruction({
      object,
      key,
      out,
      optionalObject: optional,
      node,
    }),
  );

  return out;
};

MemberExpression.handleWrite = (
  c,
  scope,
  cursor,
  node: es.MemberExpression,
) => {
  const obj = c.handle(scope, cursor, node.object);
  const key = node.computed
    ? c.handle(scope, cursor, node.property)
    : c.registerValue(new LiteralValue((node.property as es.Identifier).name));

  return value => {
    cursor.addInstruction(new ValueSetInstruction(obj, key, value, node));
  };
};

export const ArrayPattern: THandler = () => {
  throw new CompilerError("node is not supposed to be evaluated in read mode");
  // const inst: IInstruction[] = [];
  // const members: TDestructuringMembers = new Map();
  // for (let i = 0; i < node.elements.length; i++) {
  //   const element = node.elements[i];
  //   if (!element) continue;
  //   const value = pipeInsts(c.handleValue(scope, element), inst);
  //   const hasDefault = value instanceof AssignmentValue;

  //   members.set(new LiteralValue(i), {
  //     value: value.toOut(),
  //     handler(get, propExists, scope) {
  //       return c.handle(scope, element, () => {
  //         if (propExists() || !hasDefault) {
  //           const inst = get();
  //           // assigns the output to the target value
  //           pipeInsts(value["="](scope, inst[0]), inst[1]);
  //           return inst;
  //         }
  //         return value["="](scope, new LiteralValue(null));
  //       });
  //     },
  //   });
  // }
  // return [new DestructuringValue(members), inst];
};

ArrayPattern.handleWrite = (c, scope, cursor, node: es.ArrayPattern) => {
  return (value, callerNode) => {
    for (let i = 0; i < node.elements.length; i++) {
      const element = node.elements[i];
      if (!element) continue;

      const key = c.registerValue(new LiteralValue(i));
      const temp = new ImmutableId();
      cursor.addInstruction(
        new ValueGetInstruction({
          object: value,
          key,
          out: temp,
          optionalKey: element.type === "AssignmentPattern",
          node,
        }),
      );
      const assign = c.handleWrite(scope, cursor, element);
      assign(temp, callerNode);
    }
  };
};

export const ObjectPattern: THandler = () => {
  throw new CompilerError("node is not supposed to be evaluated in read mode");
  // const inst: IInstruction[] = [];
  // const members: TDestructuringMembers = new Map();
  // for (const prop of node.properties) {
  //   if (prop.type === "RestElement")
  //     throw new CompilerError("The rest operator is not supported");

  //   if (!prop) continue;

  //   const propKey = prop.key;
  //   const key =
  //     propKey.type === "Identifier" && !prop.computed
  //       ? c.registerValue(new LiteralValue(propKey.name))
  //       : c.handle(scope, cursor, propKey);
  //   const value = c.handle(scope, cursor, prop.value);
  //   const hasDefault = value instanceof AssignmentValue;

  //   members.set(key, {
  //     value: value.toOut(),
  //     handler(get, propExists, scope) {
  //       return c.handle(scope, prop, () => {
  //         const inst = keyInst;
  //         if (propExists() || !hasDefault) {
  //           const input = pipeInsts(get(), inst);
  //           // assigns the output to the target value
  //           const output = pipeInsts(value["="](scope, input), inst);
  //           return [output, inst];
  //         }

  //         const result = pipeInsts(
  //           value["="](scope, new LiteralValue(null)),
  //           inst,
  //         );
  //         return [result, inst];
  //       });
  //     },
  //   });
  // }
  // return [new DestructuringValue(members), inst];
};

ObjectPattern.handleWrite = (c, scope, cursor, node: es.ObjectPattern) => {
  return (value, callerNode) => {
    for (const prop of node.properties) {
      if (prop.type === "RestElement")
        throw new CompilerError("The rest operator is not supported", prop);

      const propKey = prop.key;
      const key =
        propKey.type === "Identifier" && !prop.computed
          ? c.registerValue(new LiteralValue(propKey.name))
          : c.handle(scope, cursor, propKey);

      const temp = new ImmutableId();

      cursor.addInstruction(
        new ValueGetInstruction({
          object: value,
          key,
          out: temp,
          optionalKey: prop.value.type === "AssignmentPattern",
          node,
        }),
      );

      const assign = c.handleWrite(scope, cursor, prop.value);
      assign(value, callerNode);
    }
  };
};

ObjectPattern.handleDeclaration = (
  c,
  scope,
  cursor,
  node: es.ObjectPattern,
  kind,
  init,
) => {
  if (!init)
    throw new CompilerError(
      "ObjectPattern.handleDeclaration called without init",
    );

  for (const prop of node.properties) {
    if (prop.type === "RestElement")
      throw new CompilerError("The rest operator is not supported", prop);

    const propKey = prop.key;
    const key =
      propKey.type === "Identifier" && !prop.computed
        ? c.registerValue(new LiteralValue(propKey.name))
        : c.handle(scope, cursor, propKey);

    const temp = new ImmutableId();

    cursor.addInstruction(
      new ValueGetInstruction({
        object: init,
        key,
        out: temp,
        optionalKey: prop.value.type === "AssignmentPattern",
        node: prop,
      }),
    );
    c.handleDeclaration(scope, cursor, prop.value, kind, temp);
  }
};

// the mlog runtime already does this check for us
export const OptionalMemberExpression: THandler = (
  c,
  scope,
  cursor,
  node: es.OptionalMemberExpression,
) => MemberExpression(c, scope, cursor, node, true);

export const AssignmentPattern: THandler = (
  c,
  scope,
  cursor,
  node: es.AssignmentPattern,
) => {
  // const [left, inst] = c.handleValue(scope, node.left);
  // const right = new LazyValue((_, out) => c.handle(scope, node.right, out));

  // return [new AssignmentValue(left, right), inst];
  throw new CompilerError(
    "AssignmentPattern handler invoked incorrectly",
    node,
  );
};

AssignmentPattern.handleWrite = (
  c,
  scope,
  cursor,
  node: es.AssignmentPattern,
) => {
  const assignLeft = c.handleWrite(scope, cursor, node.left);

  return (value, callerNode) => {
    const consequentBlock = new Block();
    const alternateBlock = new Block();
    const exitBlock = new Block();

    const result = new ImmutableId();
    const temp = new GlobalId();
    const test = new ImmutableId();
    cursor.addInstruction(
      new BinaryOperationInstruction("strictEqual", value, nullId, test, node),
    );
    cursor.setEndInstruction(
      new BreakIfInstruction(test, consequentBlock, alternateBlock, node),
    );

    cursor.currentBlock = consequentBlock;
    const defaultValue = c.handle(scope, cursor, node.right);
    cursor.addInstruction(new StoreInstruction(temp, defaultValue, node));
    cursor.setEndInstruction(new BreakInstruction(exitBlock, node));

    cursor.currentBlock = alternateBlock;
    cursor.addInstruction(new StoreInstruction(temp, value, node));
    cursor.setEndInstruction(new BreakInstruction(exitBlock, node));

    cursor.currentBlock = exitBlock;
    cursor.addInstruction(new LoadInstruction(temp, result, node));
    assignLeft(result, callerNode);
  };
};

AssignmentPattern.handleDeclaration = (
  c,
  scope,
  cursor,
  node: es.AssignmentPattern,
  kind,
  init,
) => {
  if (!init)
    throw new CompilerError(
      "AssignmentPattern.handleDeclaration called without init",
      node,
    );
  const consequentBlock = new Block();
  const alternateBlock = new Block();
  const exitBlock = new Block();

  const result = new ImmutableId();
  const temp = new GlobalId();
  const test = new ImmutableId();
  cursor.addInstruction(
    new BinaryOperationInstruction("strictEqual", init, nullId, test, node),
  );
  cursor.setEndInstruction(
    new BreakIfInstruction(test, consequentBlock, alternateBlock, node),
  );

  cursor.currentBlock = consequentBlock;
  const defaultValue = c.handle(scope, cursor, node.right);
  cursor.addInstruction(new StoreInstruction(temp, defaultValue, node));
  cursor.setEndInstruction(new BreakInstruction(exitBlock, node));

  cursor.currentBlock = alternateBlock;
  const value = c.handle(scope, cursor, node.right);
  cursor.addInstruction(new StoreInstruction(temp, value, node));
  cursor.setEndInstruction(new BreakInstruction(exitBlock, node));

  cursor.currentBlock = exitBlock;
  cursor.addInstruction(new LoadInstruction(temp, result, node));

  c.handleDeclaration(scope, cursor, node.left, kind, result);
};

// class ObjectGetSetEntry extends BaseValue {
//   macro = true;
//   getter?: IValue;
//   setter?: IValue;

//   constructor() {
//     super();
//   }

//   eval(scope: IScope, out?: TEOutput): TValueInstructions {
//     if (!this.getter)
//       throw new CompilerError("This property does not have a getter");
//     const [value, inst] = this.getter.call(scope, [], out);
//     return [value ?? new LiteralValue(null), inst];
//   }

//   "="(scope: IScope, value: IValue, out?: TEOutput): TValueInstructions {
//     if (!this.setter)
//       throw new CompilerError("This property does not have a setter");
//     const [, inst] = this.setter.call(scope, [value], out);
//     return [value, inst];
//   }
// }
