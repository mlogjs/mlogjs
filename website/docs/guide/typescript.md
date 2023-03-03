# Typescript Support

Mlogjs supports typescript out of the box, meaning that you can feed them
to the compiler and it should work as expected.

## Local installation

Note: this guide assumes that you are familiar with:

- Node.js
- npm or other package managers
- Typescript

  If you don't already have typescript installed you can install it by running:

```shell
npm install -g typescript
```

## Intellisense

To get the autocompletion and type checking features from your IDE you can run the
following command on an empty directory:

```shell
mlogjs setup --tsconfig
```

It will copy the type definitions into a `lib` folder and the `--tsconfig` flag will make it create a `tsconfig.json` file with the minimal recommended configuration.

If you place your scripts in a nested folder, you should add it to the `include` field of your `tsconfig.json`
