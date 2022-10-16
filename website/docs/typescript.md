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

To get the autocompletion and type checking features from your IDE you will have
to create a `tsconfig.json` file at the root of your project with the following contents:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "noEmit": true,
    "types": ["mlogjs/lib"]
  },
  "include": ["*.js", "*.ts*"],
  "exclude": ["node_modules"]
}
```

If you place your scripts in a nested folder, you should add it to the `include` field of your `tsconfig.json`
