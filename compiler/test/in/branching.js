let i = 1;
const a = 123;
if (i > 10) {
  if (a > 100) {
    print("I will always show up in the code");
  } else {
    print("I will never show up in the code");
  }
}

if(a < 1) {
  print("Disappears")
}
else {
  print("Stays")
}