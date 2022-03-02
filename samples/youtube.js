const dsize = 176;
const bsize = 5;
const g = -1;
let x = dsize / 2;
let y = dsize / 2;
let vx = 2;
let vy = 0;

const display = getBuilding("display1");
const switch1 = getBuilding("switch1");

draw("color", 255, 255, 255);

while (switch1.enabled) {
  x += vx;
  y += vy;
  vy += g;

  // using / because -0.x are currently not parsed properly by mindustry
  if (x < 0 || x + bsize > dsize) vx /= -1.1;
  if (y < 0 || y + bsize > dsize) vy /= -1.1;

  draw("clear");
  draw("rect", x, y, bsize, bsize);
  drawFlush(display);
}
