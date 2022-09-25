draw.clear(10, 50, 60);

draw.color(40, 50, 60);

draw.color(40, 50, 60, 12);

draw.image({
  x: 30,
  y: 60,
  image: Blocks.router,
  size: 15,
  rotation: 45,
});

draw.line({ x: 10, y: 15, x2: 60, y2: 75 });

draw.linePoly({ x: 50, y: 45, sides: 9, radius: 90, rotation: 0 });

draw.lineRect({ x: 46, y: 89, width: 10, height: 20 });

draw.poly({ x: 10, y: 23, sides: 8, radius: 10, rotation: 30 });

draw.rect({ x: 20, y: 21, width: 22, height: 23 });

draw.stroke(15);

draw.triangle({ x: 10, y: 15, x2: 20, y2: 25, x3: 30, y3: 35 });
