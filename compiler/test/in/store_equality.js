const a = Items.oxide;

switch (a) {
  case Items.beryllium:
    print("base material");
    break;
  case Items.oxide:
    print("get rusted");
    break;
  case Items.thorium:
    print("get decayed");
    break;
  default:
    print("something else");
    break;
}

let b = getLink(0);

print(b !== b);
print(b === b);
print(b != b);
