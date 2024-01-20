import { AssignmentInstruction } from "../flow";
import { es, THandler } from "../types";

export const Identifier: THandler = (
  c,
  scope,
  context,
  node: es.Identifier,
) => {
  return scope.get(node.name);
};

Identifier.handleWrite = (c, scope, context, node: es.Identifier) => {
  const variable = c.handle(scope, context, node);
  return (value, callerNode) => {
    context.addInstruction(
      new AssignmentInstruction(variable, value, callerNode),
    );
  };
};
