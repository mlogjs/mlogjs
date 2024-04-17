import { MacroFunction } from "..";
import { LiteralValue, StoreValue } from "../../values";
import { CompilerError } from "../../CompilerError";
import {
  assertIsArrayMacro,
  assertIsObjectMacro,
  assertLiteralOneOf,
} from "../../utils";
import { ImmutableId, NativeInstruction } from "../../flow";
import { Location } from "../../types";

export const validRadarFilters = [
  "any",
  "enemy",
  "ally",
  "player",
  "attacker",
  "flying",
  "boss",
  "ground",
] as const;

export const validRadarSorts = [
  "distance",
  "health",
  "shield",
  "armor",
  "maxHealth",
] as const;

export class Radar extends MacroFunction {
  constructor() {
    super((c, cursor, loc, optionsId) => {
      const options = c.getValue(optionsId);
      assertIsObjectMacro(options, "The radar options");

      const buildingId = options.data.building;
      const building = c.getValueOrTemp(buildingId);
      const filters = c.getValue(options.data.filters);
      const orderId = options.data.order;
      const order = c.getValueOrTemp(orderId);
      const sort = c.getValueOrTemp(options.data.sort);

      if (!(building instanceof StoreValue))
        throw new CompilerError("The building must a store value");

      assertIsArrayMacro(c, filters, "filters");

      const length = c.getValue(filters.data.length);

      if (!(length instanceof LiteralValue) || !length.isNumber())
        throw new CompilerError("The length of an array macro must be");

      if (length.data !== 3)
        throw new CompilerError("The filters array must have 3 items");

      // data is not an array

      const filter1 = c.getValueOrTemp(filters.data[0]);
      const filter2 = c.getValueOrTemp(filters.data[1]);
      const filter3 = c.getValueOrTemp(filters.data[2]);

      assertLiteralOneOf(filter1, validRadarFilters, "The first filter");
      assertLiteralOneOf(filter2, validRadarFilters, "The second filter");
      assertLiteralOneOf(filter3, validRadarFilters, "The third filter");

      if (!(order instanceof LiteralValue || order instanceof StoreValue))
        throw new CompilerError("The radar order must be a literal or a store");

      assertLiteralOneOf(sort, validRadarSorts, "The radar sort");

      const out = new ImmutableId();
      cursor.addInstruction(
        new NativeRadarInstruction({
          building: buildingId,
          filters: [filter1.data, filter2.data, filter3.data],
          order: orderId,
          sort: sort.data,
          out,
          loc,
        }),
      );

      return out;
    });
  }
}

class NativeRadarInstruction extends NativeInstruction {
  constructor({
    building,
    filters,
    order,
    out,
    sort,
    loc,
  }: {
    filters: [string, string, string];
    sort: string;
    building: ImmutableId;
    order: ImmutableId;
    out: ImmutableId;
    loc: Location;
  }) {
    super(
      ["radar", ...filters, sort, building, order, out],
      [building, order],
      [out],
      loc,
    );
  }
}
