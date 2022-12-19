# Dynamic Array API

While the [memory API](./memory-api) lets you have very fast number arrays,
you might want to have arrays that store other types of data, like units, buildings, items, etc.

That's where the `MutableArray` and the `DynamicArray` macros can work, they
offer an interface very similar to javascript arrays, but compile down to essentially variables with functions to get and set them.

## `MutableArray`

`MutableArray` is, as the name implies, an array with mutable fields. It allows you to set values at any valid
index, whether the index is constant or dynamic.

The `size` member is a compile-time constant value that indicates the number of items preallocated for the array.

```js
const array = new MutableArray([1, 2, 3, 4, 5]);

// double a random item in the array
const index = Math.floor(Math.rand(array.size));

// we can use `unchecked` because we know
// index is an integer that ranges from 0 to (array.size - 1)
unchecked((array[index] = array[index] * 2));

for (let i = 0; i < array.size; i++) {
  // again, we know that the index is valid
  // so we use `unchecked`
  print`${unchecked(array[i])}\n`;
}
printFlush();
```

You can use the `at` method to use negative indexes (which are relative to `size`).

```js
print(array.at(-1)); // same as array[array.size - 1];
```

And you can fill the array with a value using `fill`.

```js
array.fill(0);
```

::: warning
Using indexes that are not integers can lead to unpredictable runtime behavior.
:::

## `DynamicArray`

A `DynamicArray` instance is a `MutableArray` that "emulates" a resizeable array with a mutable length.

You can add new items to the array with `push`. But if the array is already full, the item WILL NOT
be added.

The `length` value is a variable that keeps track of the current length of the array.

```js
const array = new DynamicArray(5);

array.fill(Items.copper);
print(array.length); // 5
printFlush();

// we are in checked mode and the array is full
// so this item won't be added to the array
array.push(Items.beryllium);
```

The `at` method allows you to use negative indexes relative to `length`.

```js
print(array.at(-1)); // same as array[array.length - 1]
```

You can remove the last value in the array with `pop`.
If the array is empty, the operation is skipped.

```js
array.pop(); // this doesn't generate instructions to read the last value
print(array.pop()); // this one does
```

You can add values at the end of the array with `push`.
If the array is full, the value will not be added.

```js
array.push(Math.rand(1) > 0.5 ? Items.oxide : Items.carbide);
```

You can remove a value at a specific index using `removeAt`.
If the index is greater than or equal to the array's `length`, the operation is skipped.

```js
array.removeAt(1);
```

## Using `unchecked`

The `unchecked` function allows you to remove bound checks from index accesses and
methods of the `MutableArray` and `DynamicArray` classes.

It can remove bound checks from:

- Regular index accesses

  ```js
  unchecked(array[i]); // unchecked read
  unchecked((array[i] = 1)); // unchecked write
  ```

- The `at` method

  ```js
  unchecked(array.at(i));
  ```

- The `pop` method

  ```js
  unchecked(array.pop());
  ```

- The `push` method

  ```js
  unchecked(array.push(Math.rand(100)));
  ```

- The `removeAt` method

  ```js
  unchecked(array.removeAt(4));
  ```

::: danger

Using `unchecked` is can lead to undefined behavior and corruption of a script's control flow
if the operations are performed with a _bad state_. Here is a list of things
that are considered bad state for each method when combined with `unchecked`:

- Index accesses and `.at`:

  - The array is empty
  - The index is not an integer
  - The index is out of bounds

- `.push`

  - The array is full

- `.pop`

  - The array is empty

- `.removeAt`
  - The array is empty
  - The index is greater than or equal to the length of the array.

:::
