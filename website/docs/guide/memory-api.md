# Memory API

The Memory API allows you to interact directly with Mindustry's memory storage blocks—**Memory Cells** (`Blocks.memoryCell`, 64 addresses) and **Memory Banks** (`Blocks.memoryBank`, 512 addresses)—to store and retrieve data persistently.

Under the hood, indexing a memory structure translates directly into Mindustry's native `read` and `write` instructions.

## `MemoryView`

`MemoryView` is the modern, recommended class for creating an interface over a memory block.

### Syntax

```ts
const view = new MemoryView<T>(cell, size);
```

- **`cell`**: A reference to a linked memory cell or bank (e.g., from `getBuilding("bank1")` or `getBuildings()`).
- **`size`** _(optional)_: The number of addressable entries in the view.
  - Defaults to `64` (the capacity of a standard `@memory-cell`).
  - For a `@memory-bank`, you should specify `512`.
  - Can be a literal number (such as `64` or `512`) or a dynamic variable/store value.
- **`T`** _(optional, TypeScript only)_: The data type expected to be stored in the memory entries. Defaults to `number`.

### Creating a `MemoryView`

```js
const cell = getBuilding("cell1");
// Uses the default capacity of 64
const cellMem = new MemoryView(cell);

const bank = getBuilding("bank1");
// Specify 512 for a memory bank
const bankMem = new MemoryView(bank, 512);
```

## Reading and Writing Data

You can read and modify memory locations using standard JavaScript array indexing syntax (`[]`).

- **Read**: Reading `mem[index]` generates a `read` instruction.
- **Write**: Assigning `mem[index] = value` generates a `write` instruction.
- **In-place updates**: Compound operators such as `mem[index]++`, `mem[index] += 5`, and `--mem[index]` emit both a `read` and a `write`.

::: mlogjs-output

```js
const bank = getBuilding("bank1");
const mem = new MemoryView(bank, 512);

// Write to index 0
mem[0] = 42;

// Read from index 0
const value = mem[0];

// In-place increment
mem[1]++;
```

:::

## TypeScript Support & Generics

When using TypeScript, `MemoryView<T = number>` accepts a generic type parameter `T`. While Mindustry memory blocks store double-precision floating point numbers at the engine level, logic variables can hold symbols (such as items, blocks, or units) or custom numeric representations.

Specifying `T` ensures complete type safety and IDE autocomplete for elements stored in and retrieved from the memory view:

```ts
// Typed memory view for item symbols
const itemBuffer = new MemoryView<ItemSymbol>(getBuilding("cell1"));
itemBuffer[0] = Items.copper;
const item: ItemSymbol = itemBuffer[0];

// Typed memory view for boolean flags (0 | 1)
const flagBuffer = new MemoryView<0 | 1>(getBuilding("cell2"));
flagBuffer[0] = 1;

// Custom numeric states
type State = 0 | 1 | 2;
const stateMem = new MemoryView<State>(getBuilding("cell3"));
stateMem[0] = 2;
```

::: tip
The compiler strips TypeScript type annotations during compilation, but they provide full static type verification during development in your editor.
:::

## Deprecated `Memory` Class

Before `MemoryView` was introduced, MlogJS provided the `Memory` class.

```ts
// Deprecated syntax:
const mem = new Memory(bank, 512);
```

::: warning Deprecation Notice
`Memory` is deprecated and will be removed in a future release. It is maintained only for backwards compatibility with older scripts.

Key differences:

- `Memory` restricts capacities strictly to `64 | 128 | 512`, whereas `MemoryView` accepts any number or dynamic store expression.
- `Memory` only supports numeric values (`number`), whereas `MemoryView<T>` supports TypeScript generic typing.

For all new code, use `MemoryView`.
:::

## Examples

### Processor Run Counter & State Initialization

A common pattern is using a memory cell to persist state between processor execution loops or upon processor initialization:

::: mlogjs-output

```js
const bank = getBuilding("bank1");
const mem = new MemoryView(bank, 512);

if (mem[0] == 0) {
  mem[0] = 1;
  print("Processor initialized\n");
} else {
  let runs = mem[1];
  print`This code has run ${runs} time(s)\n`;
  mem[1]++;
}

printFlush();
```

:::

### Inter-Processor Communication (IPC)

Multiple processors can connect to the same memory cell or memory bank to exchange messages or share coordinated state:

```js
// Processor 1: Writer
const cell = getBuilding("cell1");
const mailbox = new MemoryView(cell);

const MSG_READY = 0;
const MSG_DATA = 1;

mailbox[MSG_DATA] = 100;
mailbox[MSG_READY] = 1; // Signal to consumer that data is ready
```

```js
// Processor 2: Reader
const cell = getBuilding("cell1");
const mailbox = new MemoryView(cell);

const MSG_READY = 0;
const MSG_DATA = 1;

if (mailbox[MSG_READY] == 1) {
  const data = mailbox[MSG_DATA];
  print`Received data: ${data}\n`;
  mailbox[MSG_READY] = 0; // Acknowledge receipt
}
printFlush();
```
