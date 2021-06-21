const axios = require("axios");
const cheerio = require("cheerio");

const concatAudio = require("./concatAudio");
const os = require("os");
const path = require("path");
const fs = require("fs");
// const { execSync, exec } = require("child_process");
// const request = require("request");
// const rp = require("request-promise");
const PDFDocument = require("pdfkit");
// const rimraf = require("rimraf");
const {
  sleep,
  sleep2,
  processLineByLine,
  getListFile,
  saveValueFile,
  folderExist,
  // takePositionFolder,
  deleteFolder,
  contentHandle,
  readFileGetValue,
} = require("./util");
// const psList = require("ps-list");
const { dialog } = require("electron").remote;

document.addEventListener(
  "DOMContentLoaded",
  async (event) => {
    deleteFolder("file");
    deleteFolder("pdf");
    // exec(`rmdir /s /q ${__dirname + "\\file"}`);
    // exec(`rmdir /s /q ${__dirname + "\\pdf"}`);

    //handle range slider
    const range = document.querySelector("#myRange");
    const bubble = document.querySelector(".bubble");
    const valueSpan = document.querySelector(".value");
    const button = document.querySelector("#button");
    const save = document.querySelector("#save");
    const pdf = document.querySelector("#pdf");
    const pdfPage = document.querySelector("#pdf-Page");
    const merge = document.querySelector("#merge");

    function setBubble(range, bubble) {
      const val = range.value;
      const min = range.min ? range.min : 0;
      const max = range.max ? range.max : 100;
      const newVal = Number(((val - min) * 100) / (max - min));
      valueSpan.innerHTML = val;

      // Sorta magic numbers based on size of the native UI thumb
      bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
    }

    range.addEventListener("input", () => {
      setBubble(range, bubble);
    });

    let dialogPath = null,
      dialogPathPDF = null,
      valueOfMonth = await readFileGetValue("MONTH"),
      stop = true,
      now = new Date(),
      desktopMP3 = path.join(os.homedir(), "Desktop"),
      desktopPDF = path.join(os.homedir(), "Desktop");
    if (now.getMonth() + 1 !== valueOfMonth) {
      await processLineByLine(0);
      await sleep(2000).then((_) =>
        processLineByLine(now.getMonth() + 1, "MONTH")
      );
    }

    // merge.addEventListener("click", async (event) => {
    //   const pathNameFile = await getListFile("fileMp3");

    //   if (dialogPath !== null && pathNameFile !== undefined) {
    //     await sleep(2000).then((_) => {
    //       execSync(
    //         `ffmpeg -f concat -i "${pathNameFile}" -c copy "${dialogPath}" && del /q ${
    //           __dirname + "\\file\\*.mp3"
    //         }`
    //       );
    //     });
    //   } else {
    //     dialog.showErrorBox("Error", "Choose a directory to save a file");
    //   }
    // });

    save.addEventListener("click", (event) => {
      // Resolves to a Promise<Object>
      stop &&
        dialog
          .showSaveDialog({
            title: "Select the File Path to save",
            defaultPath: path.join(desktopMP3 + "/output.mp3"),
            // defaultPath: path.join(__dirname, '../assets/'),
            buttonLabel: "Save",
            // Restricting the user to only Text Files.
            filters: [
              {
                name: "Audio Files",
                extensions: ["mp3"],
              },
            ],
            properties: [],
          })
          .then((file) => {
            // Stating whether dialog operation was cancelled or not.
            // console.log(file.canceled);
            if (!file.canceled) {
              dialogPath = file.filePath.toString().replaceAll("\\", "\\\\");
              desktopMP3 = dialogPath.replace(/[^\\]+$/g, "");
              console.log(dialogPath);
            }
          })
          .catch((err) => {
            console.log(err);
          });
    });

    pdf.addEventListener("click", (event) => {
      stop &&
        dialog
          .showSaveDialog({
            title: "Select the File Path to save",
            defaultPath: path.join(desktopPDF + "/output.pdf"),
            // defaultPath: path.join(__dirname, '../assets/'),
            buttonLabel: "Save",
            // Restricting the user to only Text Files.
            filters: [
              {
                name: "PDF Files",
                extensions: ["pdf"],
              },
            ],
            properties: [],
          })
          .then((file) => {
            // Stating whether dialog operation was cancelled or not.
            // console.log(file.canceled);
            if (!file.canceled) {
              dialogPathPDF = file.filePath.toString().replaceAll("\\", "\\\\");
              desktopPDF = dialogPathPDF.replace(/[^\\]+$/g, "");
              console.log(dialogPathPDF);
            }
          })
          .catch((err) => {
            console.log(err);
          });
    });

    button.addEventListener("click", function (e) {
      const voice = document.querySelector('input[name="voice"]:checked').value;
      const urlData = document.querySelector('input[name="url"]:checked').value;
      const speed = document.querySelector("#myRange").value;
      const text = document.querySelector("#text-area").value;
      const durationsT = parseInt(document.querySelector("#durations").value);

      if (stop === true && (dialogPath !== null || dialogPathPDF !== null)) {
        (async (textOrUrlManga, voice, speed, urlData, durationsTs) => {
          stop = false;
          try {
            let arrStr = [],
              str = "",
              getAllB = "",
              promises = [],
              arrErr = [],
              arrFileMp3,
              count_api = await readFileGetValue(),
              duration = durationsTs,
              charStr = "->\\+()",
              $,
              doc,
              imgArr = [],
              temee = 0,
              abcdxyz = 0,
              API = [
                "KofPtOsoYBiD08YqX5FbbYI7tSJuKFKu",
                "Do4Q6u29LQtbkEybtNvHjR8VvQHorrzz",
                "dHhgy8DuNHEYB4Hcrkr8Ppr1BbXEU6iG",
                "zvqHddkpkdyeJqzy8U4TOer784wT2N3H",
                "izN0N3BkvXLZmIpJOlPrFYxW1BSqwPRa",
                "6eaGiF0ukJQwB7sjINhOXCUTxf8pJa2H",
                "WKW7g4ZdYJp6w6swL8XeH6FQJYaZhcQT",
                "TTyCIuEYEQgKirWhtBTmwfL0FEQICiB0",
                "mhWsOMS8soi3s8lTcbsVCs8dOdngBJdG",
                "JL7xvSS6amlm6vHwXTMid64kxQVEgHdu",
                "EHKHi5GQVI8nDElu9NYAdZExheJeayus",
                "nWjxTs2ozBTem14FLQahFBEHYi1SPWSN",
                "qsgauPDLWZa1U45ijldofqOBVIiDzA24",
                "BM8t8nJSBncrnX9yLOtjAfebT3CwgTvU",
                "CUyHyf91QbsjK8qkWKLHq443iNGShl7o",
                "2JriPK5orTQfdflwDAJlMt7uAZoAYPhA",
                "mHWectbq9MheqEco16Vy8B129n5SDpxb",
                "NeaejCTgnhqiWkuF2myOh8PnfuOtDe4T",
                "22MYnk1hUcWNCEpHtf16O8iCW7i1UMgF",
                "VWln0lewIfxbRYBb0iBFaW3REGtemHWj",
                "oLQgHvIQqFXPexPu9MRR0Ub1xXw55RbC",
                "nDBGpA62Ju6MC3vb97XKuGk3k00kKaIg",
                "9RrUXBCOKIjFT0jAIFX8N4FY9vJFMHEL",
                "TjlJJki428XVFLgt5br2QN0D5GgrBAaS",
                "nVskMRGtZNYjQRMdXGHcylJBgUw3HA4g",
                "0hqGv0RWQCTanWrHy128XPtMDONP3yDl",
                "kR7Pgse0OnjtWVN0hNSXtPWf5mgQCIJk",
                "jlGXv0ErPwnKZU0sVJ9y5GCL6D3wa4E6",
                "lc8q8cOrFNPhZbVzkCL0nhRBlGPRIwiW",
                "9ON4SOqhE0mmZ65mFBdzqJqaV5Ax72Hl",
                "Iuh8TstSHIaoVXoSFnwCYEQbKihFvhPN",
                "LmvGc4iWzipMz65rbi0IuYcceb85rzPj",
                "YRFhlNTD1QQckLp5s0tJtuwOXEvwan21",
                "tYGaoqSVfTG64EdgdsE1SjCMabw05Zfn",
                "BWb4KWEhMto18W04Ik8bK63MNG5iXSU2",
                "9vcXcMlNE1b3eeWOAbnACEJHnPaM6uh2",
                "Rkr8vzUK3LkfcacHwF3ZedAV00UXDxrz",
                "B5NfwURfAbb9aP6QfY7QITZqpPp9vvBm",
                "UgejN2DFxTnJCquK7wN3hTokiZxWjKAw",
                "w6IWrgxHpu5agrMRC143eCX5Q96K69J4",
                "x4xkE8d1yijeHD2LMvkva1lZdWrXDSOX",
                "BxU8rO1f2x0A43ZBVlK0fcFQL8I23tsa",
                "8p3sbrz5tzH6AlICJwmgLdqFXKgfjQXn",
                "cp2WBThH9S8nqkqxCqaUR7dfUZx5kbyI",
                "2kZcOFZLLD2unweANnqWD6UNMEYd9YXR",
                "0AHuvyfQj6QyiiAAtB0MbfjwdcfegLGT",
                "1f8rW1lluSiBDwe83b91rQXWBxl1ss1F",
                "4zBwTMEyjs0i1T1UwdilimNpm8gSMis5",
                "8pYk5jB9aUoBjkEtuxRY0wbmV30C0LP3",
                "EzqDwmhvPafyTvLQJGwYzHpbz1sggHMZ",
                "i5wKENS8fAxpmbBEJ7ctbS9zWTJw5ZZD",
                "3UB0VAsnMtd2gUhYXCQnnjLObog2BQI0",
                "cIi82BjRu3Z3bleD9igc83KStKRTX4D4",
                "W2I9qabhhgU9kRbSMR6HSH6eR8XD2uQq",
                "3CiPUk43o6T1QhFM1KqN864viZKFdye2",
                "WHrMmf2QxFF9sbTU2hK25CmAyCVvW9Hm",
                "OhmoUvnEpl0GasqjYzwgA3yOJuFYZ5uN",
                "WMuCOv0hAJci5c4ST15Dbj2DqQ9aX6th",
                "ZZHUdD1qzuXjRZgKbSTHvjZG94OJr0hN",
                "QIw0Qm5bcqqTQDsAN9rcekPADn0W9gWM",
                "O9uNGTovfQy0kdPa6PTJf3j4X8311AJR",
                "SoYNXJKzR3yMdCWrd6Ns6cxVEVbNvGWz",
                "JUol0uMlCWCdYIM46OAXJtAYfjh0dYdK",
                "thQphC5AAoWGcG0yOGvK24lJO4oqwvwc",
                "xVLBQqr7qMzSLOGfsLue7wkmfm6Eg0wv",
                "IrX5ruqYztsd8g1SO0HFiMRmO3c8EJc0",
                "OqzINb0dSYJhhQe02TmUosQAeXNKfS6t",
                "SV1YqNNv9Ljbzv1fTJDax6JtJUahqo8K",
                "7A089R41x3fzfrNna4VNEjmyyVqstxwh",
                "tRbKFP9WjKKSVNmQlexAn54g3ZbMU9Jj",
                "TPapPZ80OQKB8z4AN5gQ84JL5yoGyUf1",
                "dQcKlBx7ZlFLgiwb3lXpHVGORRcEs7m4",
                "dZbc97vRJ8FMMJ98awsnurfZe01YBnNw",
                "PfINaTd6wfhcJD8rL3TRJYUjPj32Bb9O",
                "BPCztyBe0VI30F1CoQEEgK70HeoCXo02",
                "0ncQbcAosVjbXa3j2vNTbrqDOQB2mfn6",
                "3QXDp90a115naGxUdTyEG1OsHKWLmKps",
                "CHQr9BttJhhGOK2hxAVeiTtDcIaOMVle",
                "m9qUsMPO6WuvCffyA4463KN8686Y5jQy",
                "xV27cnPvIyD3Pg349qwoGHBZjuMeCswa",
                "OHzafgGY38UJz3MFU2q9kjDyo9L3YPvp",
                "9e13zs8LjIKSP11OYCsgo8JHAeUYeMEV",
                "loDOBM6LW1pbutqwP7HoZ75Zn4puh6xv",
                "OxqZQd17FGs4VCvq6O4noYZ41lUslK4x",
                "7U92wDX28mf5QMpTt54rnJijCOHj3nXi",
                "NTy3x18L097ZxUW7IqbeYaNmonbPGc29",
                "jEtHpjF6TQyV4uGhuoHdLNfqoinOIQEj",
              ];

            const defaultIMG = fs.createReadStream(
              __dirname + "\\fonts\\error-default.jpg"
            );

            const getTitles = {
              docln: [".title-top .title-item", "#chapter-content img"],
              truyenfull: ["#chapter-big-container h2"],
              meobietbay: [
                "#content .article-content .entry-header .entry-title",
                "#content .featured-image img",
              ],
              default: null,
            };

            const returnElements = (status, posi = 0) => {
              let action = getTitles[status][posi] || getTitles["default"];
              return action;
            };

            let stream = (url, g) => {
              // let regexExtension = /\.(gif|jpg|ico|js|png|mp3)/g;
              // let extension = url.match(regexExtension);
              let fixUrl = encodeURI(url);
              axios
                .get(fixUrl, {
                  responseType: "stream",
                  adapter: require("axios/lib/adapters/http"),
                })
                .then((res) => {
                  res.data
                    .pipe(fs.createWriteStream(__dirname + `\\pdf\\${g}.jpg`))
                    .on("finish", () => {
                      console.log("download img done");
                    });
                })
                .catch((err) => {
                  console.log("err fpd");
                  defaultIMG.pipe(
                    fs.createWriteStream(__dirname + `\\pdf\\${g}.jpg`)
                  );
                });
            };

            folderExist("file");
            folderExist("error");
            folderExist("pdf");
            folderExist("fixFile");

            const instance = axios.create({
              baseURL: "https://api.fpt.ai/hmi/tts/v5",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                api_key: API[count_api],
                voice: voice,
                speed: speed,
              },
            });

            doc = new PDFDocument();

            if (urlData !== "text") {
              const html = await axios.get(encodeURI(textOrUrlManga));
              $ = cheerio.load(html.data);
              let titlesQuery = returnElements(urlData);
              let imgQuery = returnElements(urlData, 1);
              if (titlesQuery !== null) {
                $(titlesQuery).each(
                  (c, d) => (getAllB += $(d).text() + "\n\n")
                );
                if (dialogPathPDF !== null) {
                  doc.pipe(fs.createWriteStream(dialogPathPDF));
                  doc
                    .font(__dirname + "/fonts/arial.ttf")
                    .fontSize(20)
                    .text(getAllB, {
                      align: "center",
                    });
                  $(imgQuery).each((c, d) => {
                    imgArr.push($(d).attr("src"));
                  });
                  for (let g = 0; g < imgArr.length; g++) {
                    await sleep2(500);
                    stream(imgArr[g], g);
                  }
                  if (urlData === "meobietbay") {
                    await sleep2(1000);
                    doc.image(__dirname + `\\pdf\\${temee}.jpg`, {
                      fit: [500, 500],
                      align: "center",
                      valign: "center",
                    });
                    doc.addPage();
                  }
                }
              }
            }
            await sleep2(2000);

            const handleContent = (e, index, querySelector) => {
              if (str.length < 1500) {
                str += e + " ";
                if (querySelector.length - 1 === index) {
                  arrStr.push(str);
                  str = "";
                }
              } else {
                str += e + " ";
                arrStr.push(str);
                str = "";
              }
            };

            const getContent = (typeData = "text", value = "") => {
              let querySelector,
                vc,
                arrVc = null;
              if (typeData === "meobietbay") {
                querySelector = $(
                  "#content .article-content .entry-content > p"
                );
              } else if (typeData === "docln") {
                querySelector = $("#chapter-content > p");
              } else if (typeData === "text") {
                vc = value.replace(/\n+/g, "\n");
                arrVc = vc.match(/[^\n]*\n|[^\n]+$/g);
                if (arrVc !== null) querySelector = arrVc;
                else querySelector = [];
              } else if (typeData === "truyenfull") {
                value = $("#chapter-c").text();
                vc = value.replace(/\n+/g, "\n");
                arrVc = vc.match(/[^,]*,|[^,]+$/g);
                if (arrVc !== null) querySelector = arrVc;
                else querySelector = [];
              }

              if (querySelector.length)
                if (typeData !== "text" && typeData !== "truyenfull") {
                  querySelector.each(async (c, d) => {
                    if (dialogPathPDF !== null) {
                      let checkImg = $(d).find("img").length;
                      if (checkImg) {
                        for (
                          let indexPdf = 0;
                          indexPdf < checkImg;
                          indexPdf++
                        ) {
                          doc
                            .addPage()
                            .image(__dirname + `\\pdf\\${temee}.jpg`, {
                              fit: [500, 600],
                              align: "center",
                              valign: "center",
                            });

                          if (
                            c !== querySelector.length - 1 &&
                            $(d).next().text().length > 0
                          )
                            doc.addPage();
                          temee++;
                        }
                      } else {
                        doc
                          .font(__dirname + "/fonts/arial.ttf")
                          .fontSize(13)
                          .text($(d).text() + "\n\n", {
                            align: "left",
                          });
                      }
                    }
                    handleContent($(d).text(), c, querySelector);
                  });
                } else {
                  if (dialogPathPDF !== null) {
                    doc.pipe(fs.createWriteStream(dialogPathPDF));
                  }

                  querySelector.forEach((c, d) => {
                    handleContent(c, d, querySelector);

                    doc
                      .font(__dirname + "/fonts/arial.ttf")
                      .fontSize(13)
                      .text(c + "\n\n", {
                        align: "left",
                      });
                  });
                }
            };

            getContent(urlData, textOrUrlManga);

            console.log(arrStr.length, API.length - 1, count_api);

            contentHandle("HANDLE");
            await sleep2(2000);
            if (dialogPathPDF !== null) doc.end();

            if (dialogPath !== null) {
              const pushPromise = (x, ar) => {
                return sleep(duration).then((v) => {
                  promises.push(instance.post("", ar));
                  console.log("promises : ", x);
                });
              };

              for (let i = 0; i < arrStr.length; i++) {
                await pushPromise(i, arrStr[i]);
              }

              //catch all errors
              const recursionApi = async (params, arrAPI, count = 0) => {
                if (params.response) {
                  if (
                    (params.response.status === 429 ||
                      params.response.status === 400) &&
                    count < arrAPI.length
                  ) {
                    // console.log(count, status, params);
                    return await axios({
                      method: "post",
                      headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        api_key: arrAPI[count],
                        voice: voice,
                        speed: speed,
                      },
                      url: "https://api.fpt.ai/hmi/tts/v5",
                      data:
                        params.config.data +
                        " --- " +
                        charStr.charAt(
                          Math.floor(Math.random() * charStr.length)
                        ) +
                        " -- ",
                    })
                      .then((res) => {
                        
                        console.log("count recursionApi :", count);
                        res["count"] = count;
                        return res;
                      })
                      .catch((error) => {
                        
                        console.log("err recursionApi", count);
                        return recursionApi(error, arrAPI, ++count);
                      });
                  }
                } else {
                  
                  console.log("err recursionApi not have API");
                  return { error: params.config.data };
                }
              };

              const promisesRejected = promises.map(
                async (e) =>
                  await e.catch((x) => recursionApi(x, API, count_api))

                //before a request is made
                // await instance.interceptors.request.use((config) => {
                //   config.headers["api_key"] = process.env.API_FPT_2;
                //   return config;
                // });
                // const data = await instance.post("", error.config.data).then((res) => {
                //   return res.data;
                // });
                // return data;
              );

              const data = await axios.all(promisesRejected).then((res) => {
                if (res[res.length - 1].count > count_api) {
                  processLineByLine(res[res.length - 1].count);
                  count_api = res[res.length - 1].count;
                  console.log(count_api);
                }
                return res.map((e) => {
                  const { error, data, config } = e;
                  if (error) return { async: "error", error };
                  return {
                    async: data.async,
                    data: config.data,
                  };
                });
              });

              // console.log(data, count_api);
             
              

              contentHandle("SAVE VALUE OF ARRAYS FILE & CREATE FILE MP3");

              saveValueFile(data, "value");

              const getFileMp3 = (u, arr, streamError, nameFolderSave) => {
                console.log("get file: ", u);
                return sleep(duration).then((_) => {
                  axios
                    .get(arr[u].async, {
                      responseType: "stream",
                      adapter: require("axios/lib/adapters/http"),
                    })
                    .then((res) => {
                      arrErr = arrErr.filter((e) => e.index !== arr[u].index);
                      console.log(arrErr, "arr");
                      res.data
                        .pipe(
                          fs.createWriteStream(
                            __dirname +
                              `/${nameFolderSave}/${
                                arr[u].index !== undefined ? arr[u].index : u
                              }.mp3`
                          )
                        )
                        .on("finish", () => {
                          console.log("download mp3 finish");
                        });
                    })
                    .catch((err) => {
                      console.log(
                        `${err.response.status}  ${
                          arr[u].index !== undefined ? arr[u].index : u
                        }.mp3`
                      );

                      if (!arr[u].hasOwnProperty("index")) arr[u]["index"] = u;
                      if (!arrErr.some((el) => el.index === arr[u].index))
                        arrErr.push(arr[u]);

                      streamError.write(
                        `${
                          arr[u].index !== undefined ? arr[u].index : u
                        }------${arr[u].async}\n${arr[u].data}\n\n-------\n`
                      );
                    });

                  // request
                  //   .get(arr[u].async, (err, response, body) => {
                  //     if (err)
                  //       streamError.write(
                  //         `${
                  //           arr[u].index !== undefined ? arr[u].index : u
                  //         }------${arr[u].async}\n${arr[u].error}\n\n-------\n`
                  //       );
                  //     if (response)
                  //       if (response.statusCode === 404) {
                
                  //         console.log(
                  //           `${response.statusCode}  ${
                  //             arr[u].index !== undefined ? arr[u].index : u
                  //           }.mp3`
                  //         );

                  //         if (!arr[u].hasOwnProperty("index"))
                  //           arr[u]["index"] = u;
                  //         if (!arrErr.some((el) => el.index === arr[u].index))
                  //           arrErr.push(arr[u]);

                  //         streamError.write(
                  //           `${
                  //             arr[u].index !== undefined ? arr[u].index : u
                  //           }------${arr[u].async}\n${arr[u].data}\n\n-------\n`
                  //         );
                  //       } else if (response.statusCode === 200) {
                  //         arrErr = arrErr.filter(
                  //           (e) => e.index !== arr[u].index
                  //         );
                  //         console.log(arrErr, "arr");
                  //       }
                  //   })
                  //   .pipe(
                  //     fs.createWriteStream(
                  //       __dirname +
                  //         `/${nameFolderSave}/${
                  //           arr[u].index !== undefined ? arr[u].index : u
                  //         }.mp3`
                  //     )
                  //   );
                });
              };

              const createFileMp3 = async (arr, nameFolder, nameFolderSave) => {
                const streamError = fs.createWriteStream(
                  __dirname + `/${nameFolder}/fileMp3Error.txt`
                );
                for (let u = 0; u < arr.length; u++) {
                  await getFileMp3(u, arr, streamError, nameFolderSave);
                }
              };

              await createFileMp3(data, "error", "file");
              await sleep2(2000);
              await createFileMp3(arrErr, "error", "file");
              await createFileMp3(arrErr, "error", "file");
              await createFileMp3(arrErr, "error", "file");
              await createFileMp3(arrErr, "error", "file");
              await createFileMp3(arrErr, "error", "file");
              await createFileMp3(arrErr, "error", "file");
              await createFileMp3(arrErr, "error", "file");
              await createFileMp3(arrErr, "error", "file");
              await createFileMp3(arrErr, "error", "file");
              await createFileMp3(arrErr, "error", "file");
              await createFileMp3(arrErr, "error", "file");
              await createFileMp3(arrErr, "error", "file");

          
              contentHandle("FIX ERROR FILE MP3", "create FileMp3 done");

              const checkError = async () => {
             
                console.log("checkError", arrErr.length, count_api);
                duration += 3000;
                console.log(duration, "----------");
                if (arrErr.length) {
                  promises = [];
                  let tempError = [...arrErr];
                  let promisesErrorRejected = null;
                  for (let y = 0; y < arrErr.length; y++) {
                    arrErr[y].data +=
                      " " +
                      charStr.charAt(
                        Math.floor(Math.random() * charStr.length)
                      ) +
                      " ";
                    await pushPromise(y, arrErr[y].data);
                  }

                  arrErr = [];

                  promisesErrorRejected = promises.map(
                    async (e) =>
                      await e.catch((x) => recursionApi(x, API, count_api))
                  );

                  const dataHandled = await axios
                    .all(promisesErrorRejected)
                    .then((res) => {
                      if (res[res.length - 1].count > count_api) {
                        processLineByLine(res[res.length - 1].count);
                        count_api = res[res.length - 1].count;
                      }
                      return res.map((e, ind) => {
                        const { error, data, config } = e;
                        if (error) return { async: "error", error };
                        return {
                          async: data.async,
                          data: config.data,
                          index: tempError[ind].index,
                        };
                      });
                    });

                  console.log(
                    "checkError END",
                    promises.length,
                    count_api,
                    "+++++++++++++++++++++++++++++"
                  );
                  await createFileMp3(dataHandled, "error", "file");
                  await sleep2(2000);
                  await createFileMp3(arrErr, "error", "file");
                  await createFileMp3(arrErr, "error", "file");
                  await createFileMp3(arrErr, "error", "file");
                  await createFileMp3(arrErr, "error", "file");
                  await createFileMp3(arrErr, "error", "file");
                  await createFileMp3(arrErr, "error", "file");
                  await createFileMp3(arrErr, "error", "file");
                  await createFileMp3(arrErr, "error", "file");
                  await createFileMp3(arrErr, "error", "file");
                  await createFileMp3(arrErr, "error", "file");
                  if (abcdxyz > 2) {
                    duration *= 2;
                    console.log(
                      "you should turn off APP, your network or server side is bad"
                    );
                  }
                  abcdxyz++;
                  await sleep(duration).then((_) => checkError());
                }
              };
              await sleep(4000).then((_) => checkError());


              contentHandle("CREATE LIST FILE MP3", "fix file success");

              arrFileMp3 = await getListFile("fileMp3");

            

              await sleep2(2000);

              concatAudio(arrFileMp3)
                .concat(dialogPath)
                .on("start", function (command) {
                  console.log("ffmpeg process started:", command);
                })
                .on("error", function (err, stdout, stderr) {
                  console.error("Error:", err);
                  console.error("ffmpeg stderr:", stderr);
                })
                .on("end", function (output) {
                  arrFileMp3.map((vz) => {
                    fs.rename(
                      vz,
                      //remove character end
                      vz.replace(/file([^file]*)$/, "fixFile$1"),
                      function (err) {
                        if (err) throw err;
                        console.log("Move complete.");
                      }
                    );
                  });

                  deleteFolder("pdf");
                });
              await sleep2(2000);

              // contentHandle("HANDLE SHELL COMMAND", "create list done");
              // const findedFolder = takePositionFolder("fileMp3.txt");
              // console.log(findedFolder);
              // await sleep(2000).then((_) => {
              //   execSync(
              //     `ffmpeg -f concat -i "${pathNameFile}" -c copy -y "${dialogPath}" && move /y "${
              //       __dirname + "\\file\\*.mp3"
              //     }" "${__dirname + "\\fixFile"}" && del /q ${
              //       __dirname + "\\pdf"
              //     }`
              //   );
              // execSync(
              //   `ffmpeg -f concat -i "${pathNameFile}" -c copy -y "${dialogPath}" && del /q ${
              //     __dirname + "\\file\\*.mp3"
              //   } && del /q ${__dirname + "\\pdf\\*.jpg"}`
              // );
              // });
            }

            stop = true;
            dialogPath = null;
            dialogPathPDF = null;
            contentHandle("done", textOrUrlManga);
          } catch (err) {
            stop = true;
            dialogPath = null;
            dialogPathPDF = null;
            console.log(err, "huydn1");
          }
        })(text, voice, speed, urlData, durationsT);
      } else {
        dialog.showErrorBox(
          "Error",
          "see path folder mp3 or wait it finish combine file mp3"
        );
      }
    });
  },
  false
);
