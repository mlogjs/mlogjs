const units = new MutableArray<UnitSymbol>([
  Units.alpha,
  Units.beta,
  Units.gamma,
  Units.flare,
]);

units[1] = Units.mono;

units.fill(Units.dagger);

unchecked((units[Math.floor(Math.rand(units.size))] = Units.navanax));

print`
${units[0]}
${units[1]}
${units[2]}
${units.at(-1)}
`;
printFlush();
wait(0.5);
