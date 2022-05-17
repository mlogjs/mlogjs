/// <reference types="mlogjs/lib" />
const enum State {
  active = 10,
  awaiting,
  inactive = "off",
  deactivated = 13,
}

print(State.active, State.awaiting, State.inactive, State.deactivated);

let foo = getVar<number | symbol | null>("@unknown");

let bar = foo as number;

let baz = foo as symbol;

let last = foo!;
