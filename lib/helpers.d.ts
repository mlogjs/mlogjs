/// <reference path="./kinds.d.ts" />

/**
 * Allows getting unlisted processor variables or symbols.
 *
 * Using this method is discouraged because most values are
 * already accessible under the namespaces `Units`, `Blocks`,
 * `Items`, `Liquids`, `ControlKind`, `Vars` and `UnitCommands`.
 *
 * @param key The identifier of the value
 */
declare function getVar<T>(key: string): T;

/**
 * Gets a building linked to the processor by its name.
 *
 * @param name
 */
declare function getBuilding<T extends BasicBuilding = AnyBuilding>(
  name: string
): T;
