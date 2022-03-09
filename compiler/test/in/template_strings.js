const turret = getBuilding("cyclone1");

// raw use of radar
`radar player enemy any distance ${turret} 1 radarResult`;

print(getVar("radarResult"));
