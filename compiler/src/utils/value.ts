import { IValue, TEOutput } from "../types";
import {
  DestructuringValue,
  IObjectValueData,
  LiteralValue,
  ObjectValue,
} from "../values";
import { discardedName } from "./constants";

export function isTemplateObjectArray(value: IValue): value is ObjectValue & {
  data: IObjectValueData & {
    raw: ObjectValue & {
      data: IObjectValueData & {
        length: LiteralValue<number>;
      };
    };
    length: LiteralValue<number>;
  };
} {
  return (
    value instanceof ObjectValue &&
    value.data.length instanceof LiteralValue &&
    value.data.length.isNumber() &&
    value.data.raw instanceof ObjectValue &&
    value.data.raw.data.length instanceof LiteralValue &&
    value.data.raw.data.length.isNumber()
  );
}

export function extractOutName(out: TEOutput | undefined) {
  if (!out || typeof out === "string") return out;
  return out.name;
}

export function extractDestrucuringOut(
  out: TEOutput | undefined,
  field: string | number
) {
  if (out === discardedName) return out;
  if (!(out instanceof DestructuringValue)) return;
  return out.fields[field] ?? discardedName;
}
