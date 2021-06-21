const { sleep2 } = require("./util");
const Voice = require("./Voice");

class TextToSpeed extends Voice {
  #API = [
    
  ];
  #streamError;

  constructor(textOrUrlManga, voice, speed, urlData, durationsTs) {
    super(textOrUrlManga, voice, speed, urlData, durationsTs);
    this.#streamError = fs.createWriteStream(
      __dirname + `/error/fileMp3Error.txt`
    );
  }

  get API() {
    return this.#API;
  }
  set API(API) {
    this.#API = API;
  }

  async getFileMp3(arr, field = true) {
    let errArr;
    errArr = field ? [] : arr;
    if (errArr)
      for (let x in arr) {
        await sleep2(this.durationsTs);
        const xArr = arr[x];
        console.log("get file: ", xArr.index ?? x);
        const stream = fs.createWriteStream(
          __dirname + `/file/${xArr.index ?? x}.mp3`
        );

        //handle side node back end
        await axios
          .get(xArr.async, {
            responseType: "stream",
            adapter: require("axios/lib/adapters/http"),
          })
          .then(async (res) => {
            await new Promise((resolve) => {
              errArr = errArr.filter((e) => e.index !== xArr.index);

              res.data.pipe(stream).on("finish", () => {
                console.log("download mp3 finish");
                resolve();
              });
            });
          })
          .catch(async (err) => {
            await new Promise((resolve) => {
              xArr["index"] ??= x;
              if (!errArr.some((e) => e.index === xArr.index))
                errArr.push(xArr);
              console.log(
                `%c${err.response?.status}`,
                `color: red`,
                `${(xArr.index ??= x)}.mp3`,
                errArr
              );

              this.#streamError.write(
                `${xArr.index ?? x}--${xArr.async}\n${xArr.data}\n\n--\n`,
                (_) => {
                  resolve();
                }
              );
            });
          });
      }
    return errArr;
  }

  toString() {
    console.log(
      this.textOrUrlManga,
      this.voice,
      this.speed,
      this.urlData,
      this.durationsTs
    );
  }
}

// const a = new TextToSpeed(1, 2, 3, 4, 5);
// a.toString();

module.exports = exports = function (
  textOrUrlManga,
  voice,
  speed,
  urlData,
  durationsTs
) {
  return new TextToSpeed(textOrUrlManga, voice, speed, urlData, durationsTs);
};
