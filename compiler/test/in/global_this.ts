const print = 1;
const Math = 2;
const Vars = 3;

const globals = globalThis as any;
globals.print(globals.Math.abs(globals.Vars.time));
globals.globalThis["print"]("hello");
