const enum State {
  active = 10,
  awaiting,
  inactive = "off",
  deactivated = 13,
  incremented,
}

print(
  State.active,
  State.awaiting,
  State.inactive,
  State.deactivated,
  State.incremented
);

let foo = getVar<number | symbol | undefined>("@unknown");

let bar = foo as number;

let baz = foo satisfies unknown;

let last = foo!;
