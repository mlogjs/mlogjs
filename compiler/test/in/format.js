printChar(128073);
printChar(Blocks.router);
format("Hello");
const packed = packColor(0.2, 0.4, 0.6, 0.8);
const { r, g, b, a } = unpackColor(packed);
print`r: ${r} g: ${g} b: ${b} a: ${a}`;
printFlush();
