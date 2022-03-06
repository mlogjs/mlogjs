# Typescript Setup

If you don't already have typescript installed you can install it by running:

```shell
npm install -g typescript
```

## Intellisense

This package does not support direct typescript integration, though you can setup a build pipeline or use javascript with a `jsconfig.json` file.

To get the best experience while developing locally, it is recommended to setup typescript to get features such as autocompletion and inline docs.

To add such features you only need to create a `jsconfig.json` or `tsconfig.json` file at the root of your project.

```json
{
  "compilerOptions": {
    "types": ["mlogjs/lib"],
    "outDir": "build" // avoids naming collisions
  },
  "include": ["*.js", "src/*.js"],
  "exclude": ["node_modules"]
}
```

## Build Pipeline

Bellow is a full example on how to setup a build pipeline to compile typescript to mlog.

tsconfig.json

```json
{
  "compilerOptions": {
    "types": ["mlogjs/lib"],
    "outDir": "build"
  },
  "include": ["src/*.ts"],
  "exclude": ["node_modules"]
}
```

And to compile a script you run the following commands:

```shell
npm run build && mlogjs build/scriptname.js build/scriptname.mlog
```
