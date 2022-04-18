/// <reference path="./kinds.d.ts" />

/**
 * Allows getting unlisted processor variables or symbols.
 *
 * Using this method is discouraged because most values are
 * already accessible under the namespaces `Units`, `Blocks`,
 * `Items`, `Liquids`, `ControlKind`, `Vars` and `UnitCommands`.
 *
 * @param name The identifier of the value
 */
declare function getVar<T>(name: string): T;

/**
 * Gets a building linked to the processor by its name.
 *
 * @param name
 */
declare function getBuilding<T extends BasicBuilding = AnyBuilding>(
  name: string
): T;

declare function concat(...strings: string[]): string;
