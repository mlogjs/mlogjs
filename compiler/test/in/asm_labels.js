let counter = 0;

while (true) {
  foo(counter);
  bar(counter + 1);
  counter = counter + 2;
}

function foo(counter) {
  asm`print ${counter}`;
  asm`jump foo always`;
  asm`foo:`;
  asm`printflush message1`;
}

function bar(counter) {
  asm`print ${counter}`;
  asm`jump bar always`;
  asm`bar:`;
  asm`printflush message1`;
}
