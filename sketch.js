let x = 0;
let y = 0;
let vx = 1;
let vy = 1;

drawColor(255, 255, 255);

while (switch1.enabled) {
  if (x < 0 || x > 166) vx *= -1;
  if (y < 0 || y > 166) vy *= -1;
  x += vx;
  y += vy;
  vy -= 0.1;
  drawClear();
  drawRect(x, y, 10, 10);
  display1.drawFlush();
}
