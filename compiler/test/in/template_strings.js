const turret = getBuilding("cyclone1");

let first = 10;
let second = 0.2;

// raw use of radar
asm`radar player enemy any distance ${turret} 1 radarResult`;

// temporary values should work too
asm`op mul foo ${first + second} 2`;

asm`
multine should be properly
        formatted
        ${first}    
    d ${second} a

    \nstuff`;

print(getVar("radarResult"));
print(getVar("foo"));
