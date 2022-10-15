import { IConstruct } from "./types";

export function constructValue(constructs: IConstruct[]) {
  const last = constructs[constructs.length - 1];
  return last?.readValue?.();
}
