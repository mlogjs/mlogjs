import { LiteralValue, ObjectValue } from "../values";
import { THandler, es, TValueInstructions, IValue } from "../types";
import { nodeName } from "../utils";

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
  let valinst: TValueInstructions<IValue | null> = node.init
    ? c.handleEval(scope, node.init)
    : [null, []];
  switch (node.id.type) {
    case "Identifier": {
      const { name } = node.id;
      const [init] = valinst;
      if (kind === "const" && !init)
        throw Error("Cannot create constant with void value.");
      if (kind === "const" && init?.constant) {
        scope.set(name, init);
        return valinst;
      } else {
        const value = scope.make(name, nodeName(node));
        if (init) {
          if (init.macro) throw new Error("Macro value must be constant.");
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
        throw new Error(
          "Cannot use array destructuring with constant with void value."
        );
      if (!init.macro)
        throw new Error("Cannot use array destructuring on non macro values");

      for (let i = 0; i < elements.length; i++) {
        const element = elements[i] as es.Identifier;

        if (!element) continue;
        const val = (init as ObjectValue).data[i]!;
        scope.set(element.name, val);
      }
      return valinst;
    }
    default:
      throw new Error("");
  }
};
