const fs = require("fs");
const axios = require("axios");

class TextToPDF {
  #defaultIMG = fs.createReadStream(__dirname + "\\fonts\\error-default.jpg");
  #titles = {
    docln: [".title-top .title-item", "#chapter-content img"],
    truyenfull: ["#chapter-big-container h2"],
    meobietbay: [
      "#content .article-content .entry-header .entry-title",
      "#content .featured-image img",
    ],
    default: null,
  };

  constructor() {}

  getTitle(linkWeb, position = 0) {
    let action = this.#titles[linkWeb][position] || this.#titles["default"];
    return action;
  }

  async downloadImg(url, g) {
    await axios
      .get(encodeURI(url), {
        responseType: "stream",
        adapter: require("axios/lib/adapters/http"),
      })
      .then(async (res) => {
        await new Promise((resolve) => {
          res.data
            .pipe(fs.createWriteStream(__dirname + `\\pdf\\${g}.jpg`))
            .on("finish", () => {
              console.log(`Download ${g}-Img Done`);
              resolve();
            });
        });
      })
      .catch(async (err) => {
        await new Promise((resolve) => {
          console.log("err fpd");
          this.#defaultIMG
            .pipe(fs.createWriteStream(__dirname + `\\pdf\\${g}.jpg`))
            .on("finish", () => {
              console.log(`Download ${g}-Img Done`);
              resolve();
            });
        });
      });
  }
}

module.exports = exports = function () {
  return new TextToPDF();
};
