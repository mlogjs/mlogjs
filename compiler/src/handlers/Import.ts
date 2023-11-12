import { CompilerError } from "../CompilerError";
import { THandler, es } from "../types";
import { LiteralValue } from "../values";

const noExternalModuleErrorMessage =
  "Cannot import values from modules that are not built into the compiler";

export const ImportDeclaration: THandler<null> = (
  c,
  scope,
  node: es.ImportDeclaration,
) => {
  if (node.source.value in scope.builtInModules) {
    for (const specifier of node.specifiers) {
      c.handle(scope, specifier, undefined, undefined, node.source.value);
    }
    return [null, []];
  }

  if (node.importKind !== "type") {
    throw new CompilerError(noExternalModuleErrorMessage);
  }

  return [null, []];
};

export const ImportDefaultSpecifier: THandler<null> = (
  c,
  scope,
  node: es.ImportDefaultSpecifier,
  out,
  source: string,
) => {
  if (!(source in scope.builtInModules)) return [null, []];
  throw new CompilerError(`"${source}" does not have a default export`);
};

export const ImportNamespaceSpecifier: THandler<null> = (
  c,
  scope,
  node: es.ImportDefaultSpecifier,
  out,
  source: string,
) => {
  scope.set(node.local.name, scope.builtInModules[source]);

  return [null, []];
};

export const ImportSpecifier: THandler<null> = (
  c,
  scope,
  node: es.ImportSpecifier,
  out,
  source: string,
) => {
  if (node.importKind === "type") return [null, []];
  if (!(source in scope.builtInModules))
    throw new CompilerError(noExternalModuleErrorMessage);

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

  const [value] = module.get(scope, key);
  scope.set(local.name, value);
  return [null, []];
};
