# Typescript Setup

## Intellisense

This package does not support direct typescript integration, though you can setup a build pipeline or use javascript with a `jsconfig.json` file.

To get the best experience while developing locally, it is recommended to setup typescript to get features such as autocompletion and inline docs.

To add such features you only need to create a `jsconfig.json` file at the root of your project.

```json
{
  "compilerOptions": {
    "types": ["mlogjs/lib"],
    "outDir": "build" // avoids naming collisions
  },
  "include": ["*.js", "src/*.js"],
  "exclude": "node_modules"
}
```
