import {
  AssignmentInstruction,
  LoadInstruction,
  StoreInstruction,
} from "../flow";
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
  const valueId = kind === "const" ? new ImmutableId() : new GlobalId();
  scope.set(node.name, valueId);
  c.setValue(valueId, new StoreValue(name));
  c.setValueName(valueId, name);

  if (!init) return;

  if (kind === "const") {
    context.addInstruction(
      new AssignmentInstruction(valueId as ImmutableId, init, node),
    );
  } else {
    context.addInstruction(
      new StoreInstruction(valueId as GlobalId, init, node),
    );
  }
};
