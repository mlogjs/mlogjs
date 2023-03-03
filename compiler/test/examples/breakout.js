const bricks = new Memory(getBuilding("bank1"), 512);
const display = getBuilding("display1");

const size = 176;

// bricks
const brickRows = 2;
const brickCols = 3;
const brickHeight = 10;
const brickWidth = size / brickCols;
const brickStartY = 176 - brickHeight * 5;
const brickEndY = brickStartY - brickHeight * brickRows;
const brickTotal = brickCols * brickRows;

// paddle
const paddleHeight = 5;
const paddleY = 10;
const paddleSpeed = 3;
const paddleController = getBuilding("switch1");

// ball
const ballMaxStartSpeed = 5;
const ballSize = 5;
const ballSizeMinus1 = ballSize - 1;

draw.color(255, 255, 255);

while (true) {
  // paddle
  let paddleWidth = 40;
  let paddleX = size / 2 - paddleWidth / 2;

  // ball
  let ballX = size / 2;
  let ballY = size / 2;
  let ballVX = Math.rand(ballMaxStartSpeed * 2) - ballMaxStartSpeed;
  let ballVY = Math.rand(ballMaxStartSpeed * 2) - ballMaxStartSpeed;

  // init game
  let brickCount = brickTotal;
  for (let i = 0; i < brickTotal; i++) bricks[i] = 1;

  // game loops
  while (1) {
    draw.clear(0, 0, 0);

    // render paddle
    draw.rect({
      x: paddleX,
      y: paddleY,
      width: paddleWidth,
      height: paddleHeight,
    });

    // render ball
    draw.rect({ x: ballX, y: ballY, width: ballSize, height: ballSize });

    // update paddle and handle paddle-wall collision
    if (paddleController.enabled) {
      if (paddleX < size - paddleWidth) paddleX += paddleSpeed;
    } else if (paddleX > 0) {
      paddleX -= paddleSpeed;
    }

    // update ball
    ballX += ballVX;
    ballY += ballVY;
    // precompute end points
    const ballXEnd = ballX + ballSize;
    const ballYEnd = ballY + ballSize;

    // handle ball-wall collision
    if (ballX < 0 || ballXEnd > size) ballVX *= -1;
    if (ballYEnd > size) ballVY *= -1;

    // handle ball-paddle collision
    if (
      ballXEnd > paddleX &&
      ballX < paddleX + paddleWidth &&
      ballYEnd > paddleY &&
      ballY < paddleY + paddleHeight
    ) {
      ballVY *= -1.1;
      ballVX += (ballX + ballSize / 2 - paddleX + paddleWidth / 2) / 10;
      paddleWidth--;
    }

    // render bricks and handle ball-brick collision
    let brickPtr = 0;
    for (let y = brickStartY; y > brickEndY; y -= brickHeight) {
      for (let x = 1; x < size; x += brickWidth) {
        // check if brick exists
        if (bricks[brickPtr] == 1) {
          // render the brick
          draw.rect({ x, y, width: brickWidth - 1, height: brickHeight - 1 });
          // detect collision
          if (
            ballXEnd > x &&
            ballX < x + brickWidth &&
            ballYEnd > y &&
            ballY < y + brickHeight
          ) {
            bricks[brickPtr] = 0;
            brickCount--;
            const brickWidthPlusBallSizeMinus1 = brickWidth + ballSizeMinus1;
            if (
              ballX > x - ballSizeMinus1 &&
              ballX < x + brickWidthPlusBallSizeMinus1
            ) {
              ballVY *= -1;
            } else {
              ballVX *= -1;
            }
          }
        }
        brickPtr++;
      }
    }

    // check game over
    if (ballY < 0 || brickCount == 0) break;

    // flush display
    drawFlush(display);
  }
}
