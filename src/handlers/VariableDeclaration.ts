import { THandler, es, TValueInstructions } from "../types";
import { nodeName } from "../utils";

export const VariableDeclaration: THandler = (
  c,
  scope,
  node: es.VariableDeclaration
) => {
  return c.handleMany(scope, node.declarations, (scope, child) =>
    VariableDeclarator(c, scope, child as es.VariableDeclarator, node.kind)
  );
};

export const VariableDeclarator: THandler = (
  c,
  scope,
  node: es.VariableDeclarator,
  kind: "let" | "var" | "const" = "let"
) => {
  let valinst: TValueInstructions = node.init
    ? c.handleEval(scope, node.init)
    : [null, []];
  const { name } = node.id as es.Identifier;
  const [init] = valinst;
  if (kind === "const" && !init)
    throw Error("Cannot create constant with void value.");
  if (kind === "const" && init.constant) {
    scope.set(name, init);
    return [init, []];
  } else {
    const value = scope.make(name, nodeName(node));
    if (init) {
      if (init.macro) throw new Error("Macro value must be constant.");
      valinst[1].push(...value["="](scope, valinst[0])[1]);
    }
    if (kind === "const") value.constant = true;
    return valinst;
  }
};
