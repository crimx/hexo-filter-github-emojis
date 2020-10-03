const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const randomUa = require("random-ua");

// get the latest github version
fetch("https://api.github.com/emojis", {
  headers: {
    "User-Agent": randomUa.generate(),
    "Content-Type": "application/json",
  },
})
  .then((t) => t.json())
  .then((json) => {
    const latestEmojis = Object.keys(json).reduce((emojis, name) => {
      emojis[name] = { src: json[name] };

      const match = /\/unicode\/(\S+)\./.exec(json[name]);
      if (match) {
        emojis[name].codepoints = match[1].split("-");
      }

      return emojis;
    }, {});

    // update local backup
    fs.writeFile(
      path.join(__dirname, "emojis.json"),
      JSON.stringify(latestEmojis, null, "  "),
      function (err) {
        if (err) {
          console.warn(err);
          process.exit(1);
        } else {
          console.log(`Update ${Object.keys(latestEmojis).length} emojis`);
        }
      }
    );
  })
  .catch((error) => {
    console.error(error);
  });
