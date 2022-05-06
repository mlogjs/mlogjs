import { ObjectValue } from "../values";
import { THandler, es, TValueInstructions, IValue } from "../types";
import { nodeName } from "../utils";
import { CompilerError } from "../CompilerError";
import { ValueOwner } from "../values/ValueOwner";

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
    case "Identifier": {
      const { name: identifier } = node.id;
      const name = nodeName(node, !c.compactNames && identifier);
      const [init] = valinst;
      if (kind === "const" && !init)
        throw new CompilerError("Constants must be initialized.");
      if (kind === "const" && init?.constant) {
        const owner = new ValueOwner({
          scope,
          identifier,
          name,
          value: init,
          constant: true,
        });
        scope.set(owner);
        return valinst;
      } else {
        const value = scope.make(identifier, name);
        if (init) {
          if (init.macro)
            throw new CompilerError("Macro values must be held by constants");

          valinst[1].push(...value["="](scope, init)[1]);
        }
        if (kind === "const") value.constant = true;
        return valinst;
      }
    }
    case "ArrayPattern": {
      const { elements } = node.id;
      const [init] = valinst;
      if (!init)
        throw new CompilerError(
          "Cannot use array destructuring without an initializer"
        );
      if (!init.macro)
        throw new CompilerError(
          "Cannot use array destructuring on non macro values"
        );

      if (kind !== "const")
        throw new CompilerError("Macro values must be held by constants");

      if (!(init instanceof ObjectValue)) {
        throw new CompilerError(
          "Array destructuring target must be an object value"
        );
      }

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];

        if (!element) continue;
        if (element.type !== "Identifier") {
          throw new CompilerError(
            "Array destructuring expression can only have empty items or identifiers",
            [element]
          );
        }

        const val = init.data[i];
        if (!val)
          throw new CompilerError(
            `The property "${i}" does not exist on the target object`,
            [element]
          );
        const owner = new ValueOwner({
          scope,
          identifier: element.name,
          name: nodeName(element, !c.compactNames && element.name),
          value: val,
          constant: true,
        });

        scope.set(owner);
      }
      return valinst;
    }
    default:
      throw new CompilerError(
        `Unsupported variable declaration type: ${node.id.type}`
      );
  }
};
