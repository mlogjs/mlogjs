const displaySize = 176;
const ballSize = 5;
const g = -1;

let x = displaySize / 2;
let y = displaySize / 2;

let vx = 0;
let vy = 2;

const display1 = getBuilding("display1");

draw.color(255, 255, 255);

while (1) {
  if (x < 0 || x + ballSize > displaySize) vx *= -1;
  if (y < 0 || y + ballSize > displaySize) vy *= -1;
  x += vx;
  y += vy;
  vy += g;

  draw.clear(0, 0, 0);
  draw.rect({ x, y, width: ballSize, height: ballSize });
  drawFlush(display1);
}
