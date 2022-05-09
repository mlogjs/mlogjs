import { ObjectValue } from "../values";
import { THandler, es, TValueInstructions, IValue, IScope } from "../types";
import { nodeName } from "../utils";
import { CompilerError } from "../CompilerError";
import { ValueOwner } from "../values/ValueOwner";
import { Compiler } from "../Compiler";

export const VariableDeclaration: THandler<null> = (
  c,
  scope,
  node: es.VariableDeclaration
) => {
  return c.handleMany(scope, node.declarations, (scope, child) =>
    VariableDeclarator(c, scope, child, node.kind)
  );
};

export const VariableDeclarator: THandler<IValue | null> = (
  c,
  scope,
  node: es.VariableDeclarator,
  kind: "let" | "var" | "const" = "let"
) => {
  const valinst: TValueInstructions<IValue | null> = node.init
    ? c.handleEval(scope, node.init)
    : [null, []];
  switch (node.id.type) {
    case "Identifier":
      return DeclareIdentifier(c, scope, node.id, kind, valinst);
    case "ArrayPattern":
      return DeclareArrayPattern(c, scope, node.id, kind, valinst);
    default:
      throw new CompilerError(
        `Unsupported variable declaration type: ${node.id.type}`
      );
  }
};

type TDeclareHandler<T extends es.Node> = (
  c: Compiler,
  scope: IScope,
  node: T,
  kind: "let" | "const" | "var",
  valinst: TValueInstructions<IValue | null>
) => TValueInstructions<null>;

const DeclareIdentifier: TDeclareHandler<es.Identifier> = (
  c,
  scope,
  node,
  kind,
  valinst
) => {
  const { name: identifier } = node;
  const name = nodeName(node, !c.compactNames && identifier);
  const [init] = valinst;
  if (kind === "const" && !init)
    throw new CompilerError("Constants must be initialized.", [node]);
  if (kind === "const" && init?.constant) {
    const owner = new ValueOwner({
      scope,
      identifier,
      name,
      value: init,
      constant: true,
    });
    scope.set(owner);
    return [null, valinst[1]];
  } else {
    const value = scope.make(identifier, name);
    if (init) {
      if (init.macro)
        throw new CompilerError("Macro values must be held by constants", [
          node,
        ]);

      valinst[1].push(...value["="](scope, init)[1]);
    }
    if (kind === "const") value.constant = true;
    return [null, valinst[1]];
  }
};

const DeclareArrayPattern: TDeclareHandler<es.ArrayPattern> = (
  c,
  scope,
  node,
  kind,
  valinst
) => {
  const { elements } = node;
  const [init] = valinst;
  if (!init)
    throw new CompilerError(
      "Cannot use array destructuring without an initializer",
      [node]
    );
  if (!init.macro)
    throw new CompilerError(
      "Cannot use array destructuring on non macro values",
      [node]
    );

  if (!(init instanceof ObjectValue)) {
    throw new CompilerError(
      "Array destructuring target must be an object value",
      [node]
    );
  }

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    if (!element) continue;
    const val = init.data[i];

    if (!val)
      throw new CompilerError(
        `The property "${i}" does not exist on the target object`,
        [element]
      );

    switch (element.type) {
      case "Identifier":
        DeclareIdentifier(c, scope, element, kind, [val, valinst[1]]);
        break;
      case "ArrayPattern":
        DeclareArrayPattern(c, scope, element, kind, [val, valinst[1]]);
        break;
      default:
        throw new CompilerError(
          `Unsupported declaration type: ${element.type}`,
          [element]
        );
    }
  }
  return [null, valinst[1]];
};
