import { CompilerError } from "../CompilerError";
import { LoadInstruction, StoreInstruction } from "../flow";
import { GlobalId, ImmutableId } from "../flow/id";
import { es, THandler } from "../types";
import { nodeName } from "../utils";
import { StoreValue } from "../values";

export const Identifier: THandler = (
  c,
  scope,
  context,
  node: es.Identifier,
) => {
  const id = scope.get(node.name);
  switch (id.type) {
    case "immutable":
      return id;
    case "global": {
      const out = new ImmutableId();
      context.addInstruction(new LoadInstruction(id, out, node));
      return out;
    }
  }
};

Identifier.handleWrite = (c, scope, context, node: es.Identifier) => {
  const id = scope.get(node.name);
  if (id.type !== "global")
    throw new Error("Cannot assign to non-global variable");
  return (value, callerNode) => {
    context.addInstruction(new StoreInstruction(id, value, callerNode));
  };
};

Identifier.handleDeclaration = (
  c,
  scope,
  context,
  node: es.Identifier,
  kind,
  init,
) => {
  const name = nodeName(node, !c.compactNames && node.name);
  if (kind === "const") {
    if (!init) throw new CompilerError("const must be initialized", node);
    scope.set(node.name, init);
    if (!c.getValueName(init)) c.setValueName(init, name);
    return;
  }

  const valueId = new GlobalId();
  scope.set(node.name, valueId);
  c.setValue(valueId, new StoreValue(name));
  c.setValueName(valueId, name);

  if (!init) return;

  context.addInstruction(new StoreInstruction(valueId, init, node));
};
