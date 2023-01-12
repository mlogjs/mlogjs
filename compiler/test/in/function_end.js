// tests wether the implicit function return
// is removed because of the `end`
// instruction present at the end of the function body
cubeRoots(-8);

function cubeRoots(number) {
  // we are not able to calculate
  // the cube root of negative numbers
  // so we'll use this workaround instead
  const sign = number > 0 ? 1 : -1;
  const p = Math.abs(number) ** (1 / 3) * sign;
  print`${p} * [cos(0°) + i sen(0°)]\n`;
  print`${p} * [cos(120°) + i sen(120°)]\n`;
  print`${p} * [cos(240°) + i sen(240°)]\n`;

  printFlush();
  endScript();
}
