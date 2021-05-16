const dsize = 176;
const bsize = 5;
const g = -1;
let x = dsize / 2;
let y = dsize / 2;
let vx = 2;
let vy = 0;

const display = Block("display1");
const switch1 = Block("switch1");

draw("color", 255, 255, 255);

while (switch1.enabled) {

    x += vx;
	y += vy;
	vy += g;

	if (x < 0 || x + bsize > dsize) vx *= -0.9;
	if (y < 0 || y + bsize > dsize) vy *= -0.9;

	draw("clear");
	draw("rect", x, y, bsize, bsize);
	display.drawFlush();
}
