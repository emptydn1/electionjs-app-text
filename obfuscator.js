const fs = require("fs");
const JavaScriptObfuscator = require("javascript-obfuscator");

const a = (name, output) => {
  fs.readFile(__dirname + name, "UTF-8", function (err, data) {
    if (err) throw err;
    const obResult = JavaScriptObfuscator.obfuscate(data);
    fs.writeFile(
      __dirname + output,
      obResult.getObfuscatedCode(),
      function (err) {
        if (err) console.log(err);
        console.log("the file was saved");
      }
    );
  });
};

a("/1.js", "/1-obfuscator.js");
a("/util.js", "/util-obfuscator.js");
