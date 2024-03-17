let counter = 0;

while (true) {
  foo(counter);
  bar(counter + 1);
  counter = counter + 2;
}

function foo(counter) {
  asm`
    print ${counter}
    jump foo always
    foo:
    printflush message1`;
}

function bar(counter) {
  asm`
    print ${counter}
    jump bar always
    bar:
    printflush message1`;
}
