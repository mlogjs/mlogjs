import {
  DestructuringValue,
  LiteralValue,
  ObjectValue,
  SenseableValue,
  TDestructuringMembers,
  VoidValue,
} from "../values";
import {
  THandler,
  es,
  TValueInstructions,
  IValue,
  IScope,
  EMutability,
  IInstruction,
} from "../types";
import { nodeName } from "../utils";
import { CompilerError } from "../CompilerError";
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

  const [value, inst] = Declare(c, scope, node.id, kind);

  if (init) {
    const [result, resultInst] = c.handleEval(scope, init, value.out);
    inst.push(...value.handler(result, resultInst)[1]);
  } else {
    inst.push(...value.handler(null, [])[1]);
  }

  return [null, inst];
};

type TDeclareHandler<T extends es.Node> = (
  c: Compiler,
  scope: IScope,
  node: T,
  kind: "let" | "const" | "var"
) => TValueInstructions<DeclarationValue>;

const Declare: TDeclareHandler<es.LVal> = (c, scope, node, kind) => {
  return c.handle(scope, node, () => {
    switch (node.type) {
      case "Identifier":
        return DeclareIdentifier(c, scope, node, kind);
      case "ArrayPattern":
        return DeclareArrayPattern(c, scope, node, kind);
      case "ObjectPattern":
        return DeclareObjectPattern(c, scope, node, kind);
      default:
        throw new CompilerError(
          `Unsupported declaration type: ${node.type}`,
          node
        );
    }
  }) as TValueInstructions<DeclarationValue>;
};
const DeclareIdentifier: TDeclareHandler<es.Identifier> = (
  c,
  scope,
  node,
  kind
) => {
  const { name: identifier } = node;
  const name = nodeName(node, !c.compactNames && identifier);
  const out = SenseableValue.from(
    scope,
    name,
    kind === "const" ? EMutability.init : EMutability.mutable
  );

  const declarationValue = new DeclarationValue({
    c,
    scope,
    node,
    out,
    handler(init, inst) {
      if (kind === "const" && !init)
        throw new CompilerError("Constants must be initialized.", node);
      if (kind === "const" && init?.mutability === EMutability.constant) {
        scope.set(identifier, init);
        return [null, inst];
      } else {
        const value = scope.make(identifier, name);

        if (init) {
          if (init.macro)
            throw new CompilerError(
              "Macro values must be held by constants",
              node
            );
          inst.push(...value["="](scope, init)[1]);
        }
        if (kind === "const") value.mutability = EMutability.constant;
        return [null, inst];
      }
    },
  });

  return [declarationValue, []];
};

const DeclareArrayPattern: TDeclareHandler<es.ArrayPattern> = (
  c,
  scope,
  node,
  kind
) => {
  const members: TDestructuringMembers = new Map();

  const { elements } = node;

  const inst: IInstruction[] = [];
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (!element) continue;

    const [value, valueInst] = Declare(c, scope, element, kind);
    inst.push(...valueInst);

    members.set(new LiteralValue(i), {
      value: value.out,
      handler(get) {
        return c.handle(scope, element, () => {
          let [init, initInst]: TValueInstructions<IValue | null> = [null, []];

          try {
            [init, initInst] = get();
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

          if (!init)
            throw new CompilerError(
              `The target object does not have a value at index ${i}`,
              element
            );

          return value.handler(init, initInst);
        });
      },
    });
  }

  const out = new DestructuringValue(members);
  const value = new DeclarationValue({
    c,
    scope,
    node,
    out,
    handler(init, initInst) {
      if (!(init instanceof ObjectValue))
        throw new CompilerError(
          "The value being destructured must be an object value"
        );

      initInst.push(...out["="](scope, init)[1]);
      return [null, initInst];
    },
  });

  return [value, inst];
};

const DeclareObjectPattern: TDeclareHandler<es.ObjectPattern> = (
  c,
  scope,
  node,
  kind
) => {
  const inst: IInstruction[] = [];

  const members: TDestructuringMembers = new Map();

  const { properties } = node;

  const propertiesInst = c.handleMany(scope, properties, prop => {
    if (prop.type === "RestElement")
      throw new CompilerError("The rest operator is not supported", prop);

    const { key, value: propValue } = prop;

    const keyInst: TValueInstructions =
      key.type === "Identifier" && !prop.computed
        ? [new LiteralValue(key.name), []]
        : c.handleConsume(scope, prop.key);

    const [value, valueInst] = Declare(c, scope, propValue as es.LVal, kind);

    members.set(keyInst[0], {
      value: value.out,
      handler(get) {
        return c.handle(scope, propValue, () => {
          const [init, initInst] = get();
          return value.handler(init, initInst);
        });
      },
    });

    return [null, [...keyInst[1], ...valueInst]];
  });

  const out = new DestructuringValue(members);
  const declarationValue = new DeclarationValue({
    c,
    scope,
    node,
    out,
    handler(init, initInst) {
      if (!init)
        throw new CompilerError(
          "Cannot use object destructuring without an initializer",
          node
        );

      initInst.push(...out["="](scope, init)[1]);

      return [null, initInst];
    },
  });
  return [declarationValue, [...inst, ...propertiesInst[1]]];
};

class DeclarationValue extends VoidValue {
  c: Compiler;
  scope: IScope;
  node: es.Node;
  out: IValue;
  /** Handles the init value */
  handle: DeclarationValue["handler"];

  constructor({
    c,
    scope,
    node,
    out,
    handler,
  }: Pick<DeclarationValue, "out" | "handler" | "c" | "scope" | "node">) {
    super();

    this.out = out;
    this.c = c;
    this.scope = scope;
    this.node = node;
    this.handle = handler;
  }

  handler(
    init: IValue | null,
    inst: IInstruction[]
  ): TValueInstructions<IValue | null> {
    return this.c.handle(this.scope, this.node, () => this.handle(init, inst));
  }
}
