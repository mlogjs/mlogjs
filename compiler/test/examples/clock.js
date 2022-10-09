draw.clear(0, 0, 0);

// draw the hour markers
for (let i = 0; i <= 330; i += 30) {
  let x = Math.sin(i) * 40;
  let y = Math.cos(i) * 40;

  draw.color(75, 75, 75, 255);
  draw.line({
    x: x * 0.8 + 40,
    y: y * 0.8 + 40,
    x2: x + 40,
    y2: y + 40,
  });
}

let h = Vars.time * 0.006;

draw.color(128, 128, 128, 255);

draw.stroke(2);

draw.line({
  x: 40,
  y: 40,
  x2: Math.sin(h) * 35 + 40,
  y2: Math.cos(h) * 35 + 40,
});

h /= 60;

draw.color(255, 255, 255, 255);

draw.line({
  x: 40,
  y: 40,
  x2: Math.sin(h) * 25 + 40,
  y2: Math.cos(h) * 25 + 40,
});

h /= 12 + 270;

draw.color(255, 64, 64, 255);

draw.line({
  x: 40,
  y: 40,
  x2: Math.sin(h) * 15 + 40,
  y2: Math.cos(h) * 15 + 40,
});

drawFlush();
