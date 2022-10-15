// credits to Vinicius Rangel#0001
const display = getBuilding("display1");

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

// eslint-disable-next-line no-constant-condition
while (true) {
  draw.clear(0, 0, 0);

  drawLine(
    points[0][0],
    points[0][1],
    points[0][2], // 0
    points[0][3],
    points[0][4],
    points[0][5]
  );
  drawLine(
    points[1][0],
    points[1][1],
    points[1][2], // 1
    points[1][3],
    points[1][4],
    points[1][5]
  );
  drawLine(
    points[2][0],
    points[2][1],
    points[2][2], // 2
    points[2][3],
    points[2][4],
    points[2][5]
  );
  drawLine(
    points[3][0],
    points[3][1],
    points[3][2], // 3
    points[3][3],
    points[3][4],
    points[3][5]
  );
  drawLine(
    points[4][0],
    points[4][1],
    points[4][2], // 4
    points[4][3],
    points[4][4],
    points[4][5]
  );
  drawLine(
    points[5][0],
    points[5][1],
    points[5][2], // 5
    points[5][3],
    points[5][4],
    points[5][5]
  );
  drawLine(
    points[6][0],
    points[6][1],
    points[6][2], // 6
    points[6][3],
    points[6][4],
    points[6][5]
  );
  drawLine(
    points[7][0],
    points[7][1],
    points[7][2], // 7
    points[7][3],
    points[7][4],
    points[7][5]
  );
  drawLine(
    points[8][0],
    points[8][1],
    points[8][2], // 8
    points[8][3],
    points[8][4],
    points[8][5]
  );
  drawLine(
    points[9][0],
    points[9][1],
    points[9][2], // 9
    points[9][3],
    points[9][4],
    points[9][5]
  );
  drawLine(
    points[10][0],
    points[10][1],
    points[10][2], // 10
    points[10][3],
    points[10][4],
    points[10][5]
  );
  drawLine(
    points[11][0],
    points[11][1],
    points[11][2], // 11
    points[11][3],
    points[11][4],
    points[11][5]
  );

  drawFlush(display);

  rotate(2, 5, Math.rand(2));
}

function drawLine(p1x, p1y, p1z, p2x, p2y, p2z) {
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
    Math.cos(y) * Math.cos(x)
  );
}
