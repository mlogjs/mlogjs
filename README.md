# mlogcc v0.0.2 -> 0.1.0

Mlogcc is a compiler that compiles Javascript code into Mindustry logic code.

## Discord

You can join my discord server for more information on this compiler. 
I will also host polls on features to support.

https://discord.gg/98KWSSUPVj

Thank you!

## Installation

`npm i -g mlogcc`

## Help

`mlogcc help`

## Getting started

It is super simple to get started. Here is a simple example...

```js
print("Hello world");
printFlush(message1);
```

> Note that all blocks are Javascript variables.

The above is not fancy enough. We can make it fancy...

```js
message1.print("Hello world");
```

What about compiling it?

```sh
touch my-code.js
mlogcc my-code.js my-compiled-code.mlog
```

> Of course, make sure you have installed the CLI tool `mlogcc` globally.

## Are control statements and functions supported? Yes, they are!

```js
for (let i = 0; i < 100; i++) {
  message1.print(i);
}

let counter = 0;
while (counter++ < 100) {
  // whoops, currently the ++ unary operator does not return a value.
  message1.print(counter);
}

// therefore, you must do the following
while (counter < 100) {
  counter++;
  message1.print(counter);
}

if (false) {
  message1.print("You will never see me");
} else {
  message1.print("You will see me");
}

function sayHello() {
  message1.print("Hello there");
}

function add(a, b) {
  return a + b;
}

let sum = add(1, 2);
message1.print(sum);
```

## Can I combine Mlog with JS? No, you can't!

This feature has been sacrificed to fix a bug!

```js
const block = new Message(1);
const message = "Hello world";
`print ${message}`;
`printflush ${block}`;
```

## Interacting with Memory blocks

```js
// writing the value 1 at index 0 of the memory block aka array.
bank1[0] = 1;
// reading from the memory block
const value = bank1[0]; // value == 1
```

> Make sure that you have properly linked the block.

## API

> Most of the following API is similar to the Mindustry Logic API. So if something is not clear here, please refer to the Mlog documentation. Blocks are of course an exception.

> When trying to access a member on the MacroBlock that does not exist in the defined interface, the compiler will understand.

```js
// getting an inexistent member
if (switch1.enabled) {
  // the enabled member does not exist
  // ...
}
// so it will do...
if (switch1.sensor("enabled")) {
  // So cool, right?
}
// setting an inexistent member is the same principle, but this time it will use the control function.
```

Here come the API definitions.

```ts

interface MacroBlock {
    print: (...args: any[]) => void
    read: (i: number) => number
    write: (i: number, value: number) => void
    printFlush: () => void
    drawFlush: () => void
    sensor: (name: string) => any
    control: (name: string, ...args) => void
    radar: (target1, target2, target3, order, sort) => any
    shoot: (x, y, shoot) => void
    shootP: (unit, shoot) => void
}

// blocks
function Block (name: string) : MacroBlock
function Bank (id: number) : MacroBlock
function Cell (id: number) : MacroBlock
function Display (id: number) : MacroBlock
function Switch (id: number) : MacroBlock
function Message (id: number) : MacroBlock
// printing
function print: (...args: string[])
function printFlush: (block: MacroBlock)
// drawing
function draw: (shape: string, ...args: any[])
function drawFlush: (block: MacroBlock)
function drawClear: (r : number, g : number, b : number)
function drawColor: (r : number, g : number, b : number, a: number)
function drawStoke: (width : number)
function drawLine: (x : number, y : number, x2 : number, y2 : number)
function drawRect: (x, y, width, height)
function drawLineRect: (x, y, width, height)
function drawPoly: (x : number, y : number, sides : number, radius : number, rotation : number)
function drawLinePoly: (x : number, y : number, sides : number, radius : number, rotation : number)
function drawTriangle: (x : number, y : number, x2 : number, y2 : number, x3 : number, y3 : number)
function drawImage: (x : number, y : number, image : string, size : number, rotation : number)
// memory
function read: (block: MacroBlock, i)
function write: (block: MacroBlock, i, value)
// math
function atan2: (a : number, b : number)
function dst: (n : number)
function noise: (n : number)
function abs: (n : number)
function log: (n : number)
function log10: (n : number)
function sin: (n : number)
function cos: (n : number)
function tan: (n : number)
function floor: (n : number)
function ceil: (n : number)
function sqrt: (n : number)
function rand: (n : number)
// other
function sensor: (block: MacroBlock, name: string)
function control: (block: MacroBlock, name: string, ...args)
function radar: (block: MacroBlock, target1, target2, target3, order, sort)
function unitBind: (type)
function unitControl: (name, ...args)
function unitRadar: (target1, target2, target3, order, sort)
```

## Feel like contributing? Yes, you can!

I will be super happy to work with you and make this project better. If you looked into the file structure, you can see that I have made a `basic` directory. I made a `basic` directory because this compiler was meant to support two compilation modes: `basic` and `full`. The `full` compilation mode will support fully recursive function calls because it will store data on the stack (inside a memory block).
