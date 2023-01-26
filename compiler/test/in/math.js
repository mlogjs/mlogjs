let a = 10;
let b = 20;
Math.max(a, b);
Math.min(a, b);
Math.angle(a, b);
Math.len(a, b);
Math.noise(a, b);
Math.abs(a);
Math.log(a);
Math.log10(a);
Math.sin(a);
Math.cos(a);
Math.tan(a);
Math.floor(a);
Math.ceil(a);
Math.sqrt(a);
Math.rand(a);
Math.asin(a);
Math.acos(a);
Math.atan(a);
Math.idiv(a, 2);
Math.pow(a, 2);

// compile time evaluation

// this prevents the optimizer from removing the results
let temp = 0;
temp = Math.max(10.5, 20);
temp = Math.min(10.5, 20);
temp = Math.angle(10.5, 20);
temp = Math.len(10.5, 20);
temp = Math.noise(10.5, 20);
temp = Math.abs(10.5);
temp = Math.log(10.5);
temp = Math.log10(10.5);
temp = Math.sin(10.5);
temp = Math.cos(10.5);
temp = Math.tan(10.5);
temp = Math.floor(10.5);
temp = Math.ceil(10.5);
temp = Math.sqrt(10.5);
temp = Math.rand(10.5);
temp = Math.asin(10.5);
temp = Math.acos(10.5);
temp = Math.atan(10.5);
temp = Math.idiv(5, 2);
temp = Math.pow(2, 9);

print`
${Math.PI}
${Math.E}
${Math.radToDeg}
${Math.degToRad}
`;
