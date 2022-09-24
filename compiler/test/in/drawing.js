draw({ mode: "clear", r: 10, g: 50, b: 60 });

draw({ mode: "color", r: 40, g: 50, b: 60 });

draw({ mode: "color", r: 40, g: 50, b: 60, a: 12 });

draw({
  mode: "image",
  x: 30,
  y: 60,
  image: Blocks.router,
  size: 15,
  rotation: 45,
});

draw({ mode: "line", x: 10, y: 15, x2: 60, y2: 75 });

draw({ mode: "linePoly", x: 50, y: 45, sides: 9, radius: 90, rotation: 0 });

draw({ mode: "lineRect", x: 46, y: 89, width: 10, height: 20 });

draw({ mode: "poly", x: 10, y: 23, sides: 8, radius: 10, rotation: 30 });

draw({ mode: "rect", x: 20, y: 21, width: 22, height: 23 });

draw({ mode: "stroke", width: 15 });

draw({ mode: "triangle", x: 10, y: 15, x2: 20, y2: 25, x3: 30, y3: 35 });
