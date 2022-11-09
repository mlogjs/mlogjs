// the type annotation prevents typescript
// from inferring the type as `1`
/** @type {number} */
const a = 1;

// Tests the optimization when the case is
// "isolated" from the others
switch (a) {
  case 0:
    print("first");
    break;
  case 1:
    print("second");
    break;
  case 3:
    print("third");
}

// Tests the optimization with falltrough
// cases before the constant case
// and with a dynamic case after the constant case
switch (a) {
  case 0:
    print("a");
    break;
  case Math.floor(Math.rand(10)):
    print("meh");
  case 1:
    print("b");
  case 3:
    print("c");
    break;
  case Math.floor(Math.rand(10)):
    print("foo");
    break;
}
