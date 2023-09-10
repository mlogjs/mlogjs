// credits to Vinicius Rangel#0001

const points = [
  [-1, -1, -1, -1, 1, -1], // 0
  [1, -1, -1, 1, 1, -1], // 1
  [-1, -1, 1, -1, 1, 1], // 2
  [1, -1, 1, 1, 1, 1], // 3
  [-1, -1, -1, -1, -1, 1], // 4
  [1, -1, -1, 1, -1, 1], // 5
  [-1, 1, -1, -1, 1, 1], // 6
  [1, 1, -1, 1, 1, 1], // 7
  [-1, -1, -1, 1, -1, -1], // 8
  [-1, 1, -1, 1, 1, -1], // 9
  [-1, -1, 1, 1, -1, 1], // 10
  [-1, 1, 1, 1, 1, 1], // 11
];

let a11 = 1,
  a12 = 0,
  a13 = 0;
let a21 = 0,
  a22 = 1,
  a23 = 0;
let a31 = 0,
  a32 = 0,
  a33 = 1;

const padding = 77 / 2;

draw.color(255, 255, 255);

while (true) {
  draw.clear(0, 0, 0);

  drawLine(points[0]);
  drawLine(points[1]);
  drawLine(points[2]);
  drawLine(points[3]);
  drawLine(points[4]);
  drawLine(points[5]);
  drawLine(points[6]);
  drawLine(points[7]);
  drawLine(points[8]);
  drawLine(points[9]);
  drawLine(points[10]);
  drawLine(points[11]);

  drawFlush();

  rotate(2, 5, Math.rand(2));
}

/** @param {number[]} positions */
function drawLine([p1x, p1y, p1z, p2x, p2y, p2z]) {
  const z1 = a31 * p1x + a32 * p1y + a33 * p1z;
  const z2 = a31 * p2x + a32 * p2y + a33 * p2z;
  const persp1 = padding / (z1 + 3);
  const persp2 = padding / (z2 + 3);
  draw.line({
    x: (a11 * p1x + a12 * p1y + a13 * p1z) * persp1 + padding,
    y: (a21 * p1x + a22 * p1y + a23 * p1z) * persp1 + padding,
    x2: (a11 * p2x + a12 * p2y + a13 * p2z) * persp2 + padding,
    y2: (a21 * p2x + a22 * p2y + a23 * p2z) * persp2 + padding,
  });
}

function multiplyMatrices(b11, b12, b13, b21, b22, b23, b31, b32, b33) {
  const _a11 = a11,
    _a12 = a12,
    _a13 = a13;
  const _a21 = a21,
    _a22 = a22,
    _a23 = a23;
  const _a31 = a31,
    _a32 = a32,
    _a33 = a33;
  a11 = _a11 * b11 + _a12 * b21 + _a13 * b31;
  a12 = _a11 * b12 + _a12 * b22 + _a13 * b32;
  a13 = _a11 * b13 + _a12 * b23 + _a13 * b33;
  a21 = _a21 * b11 + _a22 * b21 + _a23 * b31;
  a22 = _a21 * b12 + _a22 * b22 + _a23 * b32;
  a23 = _a21 * b13 + _a22 * b23 + _a23 * b33;
  a31 = _a31 * b11 + _a32 * b21 + _a33 * b31;
  a32 = _a31 * b12 + _a32 * b22 + _a33 * b32;
  a33 = _a31 * b13 + _a32 * b23 + _a33 * b33;
}

function rotate(x, y, z) {
  multiplyMatrices(
    Math.cos(z) * Math.cos(y),
    -Math.sin(z) * Math.cos(x) + Math.cos(z) * Math.sin(y) * Math.sin(x),
    Math.sin(z) * Math.sin(x) + Math.cos(z) * Math.cos(x) * Math.sin(y),
    Math.sin(z) * Math.cos(y),
    Math.cos(z) * Math.cos(x) + Math.sin(z) * Math.sin(y) * Math.sin(x),
    -Math.cos(z) * Math.sin(x) + Math.sin(z) * Math.cos(x) * Math.sin(y),
    -Math.sin(y),
    Math.cos(y) * Math.sin(x),
    Math.cos(y) * Math.cos(x),
  );
}
