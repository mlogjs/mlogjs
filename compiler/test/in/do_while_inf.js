let i = 0;
do {
  print(i, "\n");
  i += Math.rand(1) > 0.5 ? 2 : 1;
} while (true);
