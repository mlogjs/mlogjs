const turret = getBuilding("cyclone1");

let first = 10;
let second = 0.2;

// raw use of radar
`radar player enemy any distance ${turret} 1 radarResult`;

// temporary values should work too
`op mul foo ${first + second} 2`;
print(getVar("radarResult"));
print(getVar("foo"));
