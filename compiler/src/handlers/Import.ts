import { CompilerError } from "../CompilerError";
import { THandler, es } from "../types";
import { nullId } from "../utils";
import { LiteralValue } from "../values";

const noExternalModuleErrorMessage =
  "Cannot import values from modules that are not built into the compiler";

export const ImportDeclaration: THandler = (
  c,
  scope,
  context,
  node: es.ImportDeclaration,
) => {
  if (node.importKind === "type") return nullId;

  if (!(node.source.value in scope.builtInModules))
    throw new CompilerError(noExternalModuleErrorMessage);

  for (const specifier of node.specifiers) {
    c.handle(scope, context, specifier, undefined, node.source.value);
  }
  return nullId;
};

export const ImportDefaultSpecifier: THandler = (
  c,
  scope,
  context,
  node: es.ImportDefaultSpecifier,
  source: string,
) => {
  if (!(source in scope.builtInModules)) return nullId;
  throw new CompilerError(`"${source}" does not have a default export`);
};

export const ImportNamespaceSpecifier: THandler = (
  c,
  scope,
  context,
  node: es.ImportDefaultSpecifier,
  source: string,
) => {
  scope.set(node.local.name, scope.builtInModules[source]);

  return nullId;
};

export const ImportSpecifier: THandler = (
  c,
  scope,
  context,
  node: es.ImportSpecifier,
  source: string,
) => {
  if (node.importKind === "type") return nullId;

  const module = scope.builtInModules[source];
  const { imported, local } = node;
  const importedName =
    imported.type === "Identifier" ? imported.name : imported.value;

  const key = new LiteralValue(importedName);

  if (!module.hasProperty(scope, key)) {
    throw new CompilerError(
      `The requested module '${source}' does not provide an export named '${importedName}'`,
    );
  }

  //  TODO: update after dealing with object members
  const [value] = module.get(scope, key);
  scope.set(local.name, value as any as number);
  return nullId;
};
