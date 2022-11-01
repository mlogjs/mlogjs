import { LiteralValue, ObjectValue, SenseableValue } from "../values";
import {
  THandler,
  es,
  TValueInstructions,
  IValue,
  IScope,
  EMutability,
  TEOutput,
} from "../types";
import { assign, nodeName } from "../utils";
import { CompilerError } from "../CompilerError";
import { ValueOwner } from "../values/ValueOwner";
import { Compiler } from "../Compiler";

export const VariableDeclaration: THandler<null> = (
  c,
  scope,
  node: es.VariableDeclaration
) => {
  return c.handleMany(scope, node.declarations, child =>
    VariableDeclarator(c, scope, child, undefined, node.kind)
  );
};

export const VariableDeclarator: THandler<null> = (
  c,
  scope,
  node: es.VariableDeclarator,
  out,
  kind: "let" | "var" | "const" = "let"
) => {
  const { init } = node;
  const load: TLoader = init
    ? (scope, out) => c.handleEval(scope, init, out)
    : () => [null, []];

  return Declare(c, scope, node.id, kind, load);
};

type TLoader = (
  scope: IScope,
  out?: TEOutput
) => TValueInstructions<IValue | null>;

type TDeclareHandler<T extends es.Node> = (
  c: Compiler,
  scope: IScope,
  node: T,
  kind: "let" | "const" | "var",
  load: TLoader
) => TValueInstructions<null>;

const Declare: TDeclareHandler<es.LVal> = (c, scope, node, kind, load) => {
  return c.handle(scope, node, () => {
    switch (node.type) {
      case "Identifier":
        return DeclareIdentifier(c, scope, node, kind, load);
      case "ArrayPattern":
        return DeclareArrayPattern(c, scope, node, kind, load);
      case "ObjectPattern":
        return DeclareObjectPattern(c, scope, node, kind, load);
      default:
        throw new CompilerError(
          `Unsupported declaration type: ${node.type}`,
          node
        );
    }
  }) as TValueInstructions<null>;
};
const DeclareIdentifier: TDeclareHandler<es.Identifier> = (
  c,
  scope,
  node,
  kind,
  load
) => {
  const { name: identifier } = node;
  const name = nodeName(node, !c.compactNames && identifier);

  const [init, inst] = load(scope, name);

  if (kind === "const" && !init)
    throw new CompilerError("Constants must be initialized.", node);
  if (kind === "const" && init?.mutability === EMutability.constant) {
    const owner = new ValueOwner({
      scope,
      identifier,
      name,
      value: init,
      constant: true,
    });
    scope.set(owner);
    return [null, inst];
  } else {
    let value: IValue;
    if (init?.owner?.name === name) {
      value = assign(new SenseableValue(scope), {
        mutability: EMutability.mutable,
      });
      const owner = new ValueOwner({
        scope,
        value,
        identifier,
        name,
      });
      init.owner.moveInto(owner);
      scope.set(owner);
    } else {
      value = scope.make(identifier, name);
    }

    if (init) {
      if (init.macro)
        throw new CompilerError("Macro values must be held by constants", node);

      inst.push(...value["="](scope, init)[1]);
    }
    if (kind === "const") value.mutability = EMutability.constant;
    return [null, inst];
  }
};

const DeclareArrayPattern: TDeclareHandler<es.ArrayPattern> = (
  c,
  scope,
  node,
  kind,
  load
) => {
  const [init, inst] = load(scope);
  const { elements } = node;
  if (!(init instanceof ObjectValue))
    throw new CompilerError(
      "The value being destructured must be an object value"
    );

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (!element) continue;

    const loader: TLoader = (scope, out) => {
      let val: TValueInstructions<IValue | null> = [null, []];

      try {
        val = init.get(scope, new LiteralValue(i), out);
      } catch (e) {
        // catches the "cannot get undefined member" error
        // TODO: refactor and add error codes
        // so we don't have to do string checks
        if (
          !(e instanceof CompilerError) ||
          !e.message.includes("undefined member")
        )
          throw e;
      }

      if (!val[0])
        throw new CompilerError(
          `The target object does not have a value at index ${i}`,
          element
        );

      return val;
    };

    inst.push(...Declare(c, scope, element, kind, loader)[1]);
  }
  return [null, inst];
};

const DeclareObjectPattern: TDeclareHandler<es.ObjectPattern> = (
  c,
  scope,
  node,
  kind,
  load
) => {
  const [base, inst] = load(scope);

  if (!base)
    throw new CompilerError(
      "Cannot use object destructuring without an initializer",
      node
    );
  const { properties } = node;
  const [init, initInst] = base.consume(scope);

  inst.push(...initInst);
  const propertiesInst = c.handleMany(scope, properties, prop => {
    if (prop.type === "RestElement")
      throw new CompilerError("The rest operator is not supported", prop);

    const { key, value } = prop;

    const keyInst: TValueInstructions =
      key.type === "Identifier" && !prop.computed
        ? [new LiteralValue(key.name), []]
        : c.handleConsume(scope, prop.key);

    const loader: TLoader = (scope, out) => init.get(scope, keyInst[0], out);

    const declarationInst = Declare(c, scope, value as es.LVal, kind, loader);

    return [null, [...keyInst[1], ...declarationInst[1]]];
  });

  return [null, [...inst, ...propertiesInst[1]]];
};
