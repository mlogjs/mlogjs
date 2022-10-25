/// <reference path="./kinds.d.ts" />

/**
 * Allows getting unlisted processor variables or symbols.
 *
 * Using this method is discouraged because most values are
 * already accessible under the namespaces `Units`, `Blocks`,
 * `Items`, `Liquids`, `ControlKind` and `Vars`.
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

/** Concatenates a list of constant strings */
declare function concat(...strings: string[]): string;

/**
 * Inlines raw mlog code. Variables and expressions can be placed inside.
 *
 * Although possible, using this function is heavily not recommended since
 * you lose the benefits of getting type cheking and validation for some
 * commands.
 *
 * ```js
 *  let x = 10
 *  asm`ucontrol build ${x} ${x * 2} @router 0 0`
 * ```
 */
declare function asm(strings: TemplateStringsArray, ...values: unknown[]): void;
