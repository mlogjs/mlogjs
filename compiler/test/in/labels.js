loop1: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i == 1 && j == 1) continue loop1;

    print`i = ${i}, j = ${j}\n`;
  }
}

let i = 0;

outer: while (i < 100) {
  let j = 0;
  inner: do {
    if (i == j) break outer;
    if (i < j) break inner;
    j++;
  } while (j < 100);
}
