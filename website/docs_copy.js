const fs = require("node:fs");
console.log("# mkdir -p ../docs && cp -r docs/.vitepress/dist/. ../docs");
if (!fs.existsSync("../docs"))
  fs.mkdir("../docs", err => {
    if (err) console.error(err);
  });
fs.cp("docs/.vitepress/dist", "../docs", { recursive: true }, err => {
  if (err) console.error(err);
});
