# Getting started.

## Online editor

The quickest way to get started on the compiler is with the
[web editor](/editor). There you can write javascript/typescript code and benefit from the following features:

- ### Live compilation

  See changes in your code reflect instantly on the output.

  <video autoplay loop muted>
    <source src="/live_compilation_demo.mp4" />
    Your browser does not support the video tag.
  </video>

- ### Source mapping

  See which parts of your code generate which instructions.

  <video autoplay loop muted>
    <source src="/sourcemapping_demo.mp4" />
    Your browser does not support the video tag.
  </video>

- ### Goto jump line

  See where a jump instruction goes.

  <video autoplay loop muted>
  <source src="/jump_goto_demo.mp4" />
  Your browser does not support the video tag.
  </video>

- ### Integration with [Mlog Watcher](https://github.com/Sharlottes/MlogWatcher)

  Send the compiled code to your currently selected processor by pressing <kbd>Ctrl</kbd>+<kbd>S</kbd> or enabling auto sending.

  You can enable this functionality in the settings.

  <video autoplay loop muted>
  <source src="https://github.com/Sharlottes/MlogWatcher/assets/61994401/4df1ba70-d9dc-4b9b-935d-e11e2c2f2d46">
  Your browser does not support the video tag.
  </video>

## Local setup

This section assumes that you are familiar with the following concepts:

- The command line terminal
- Using javascript package managers

If you want to edit your scripts in your preferred editor you can install
the compiler locally by running the command bellow.

```shell
npm i -g mlogjs
```

Then you will be able to compile your scripts with the `mlogjs` command:

```shell
mlogjs my_script.js
```
