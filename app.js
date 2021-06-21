const TextToSpeed = require("./TextToSpeed");
const TextToPDF = require("./TextToPDF");
const axios = require("axios");
const cheerio = require("cheerio");
const PDFDocument = require("pdfkit");
const os = require("os");
const path = require("path");
const fs = require("fs");
const concatAudio = require("./concatAudio");
const {
  sleep,
  sleep2,
  processLineByLine,
  getListFile,
  saveValueFile,
  folderExist,
  deleteFolder,
  readFileGetValue,
  format2,
  folderExistNew,
} = require("./util");
const { dialog } = require("electron").remote;

document.addEventListener(
  "DOMContentLoaded",
  async (_) => {
    let c_api = await readFileGetValue();
    const TTS = new TextToSpeed();
    const chars = document.querySelector("#characters");
    let lmlm = "->\\/,.>+()_".charAt(
      Math.floor(Math.random() * "->\\/,.>+()_".length)
    );
    let lnlnlm = lmlm + lmlm + lmlm + lmlm + "huy";
    deleteFolder("file");
    deleteFolder("pdf");
    deleteFolder("fixFile");
    const az = axios.create({
      baseURL: "https://api.fpt.ai/hmi/tts/v5",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
        api_key: TTS.API[c_api],
        voice: "banmai",
      },
    });

    const tes = await az
      .post("", lnlnlm)
      .then((v) => {
        console.log(v, +v["headers"]["x-ratelimit-remaining-free-month"]);
        return +v["headers"]["x-ratelimit-remaining-free-month"];
      })
      .catch((_) => console.log("not found"));

    let cal = tes + (TTS.API.length - c_api - 1) * 100000;
    let c_chars = format2(cal);
    setTimeout(() => {
      chars.innerHTML = c_chars;
    }, 500);

    //handle range slider
    const range = document.querySelector("#myRange");
    const bubble = document.querySelector(".bubble");
    const valueSpan = document.querySelector(".value");
    const button = document.querySelector("#button");
    const save = document.querySelector("#save");
    const pdf = document.querySelector("#pdf");
    const pdfPage = document.querySelector("#pdf-Page");
    const merge = document.querySelector("#merge");

    //audio
    // const audioT = document.querySelector("#audioT");
    // const mp3Source = document.querySelector("#mp3Source");

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
      stop &&
        dialog
          .showSaveDialog({
            title: "Select the File Path to save",
            defaultPath: path.join(desktopMP3 + "/output.mp3"),
            buttonLabel: "Save",
            filters: [
              {
                name: "Audio Files",
                extensions: ["mp3"],
              },
            ],
            properties: [],
          })
          .then((file) => {
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
            buttonLabel: "Save",
            filters: [
              {
                name: "PDF Files",
                extensions: ["pdf"],
              },
            ],
            properties: [],
          })
          .then((file) => {
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
      const textOrUrlManga = document.querySelector("#text-area").value;
      const voice = document.querySelector('input[name="voice"]:checked').value;
      const speed = document.querySelector("#myRange").value;
      const urlData = document.querySelector('input[name="url"]:checked').value;
      const durationsTs = parseInt(document.querySelector("#durations").value);

      if (stop === true && (dialogPath !== null || dialogPathPDF !== null)) {
        stop = false;
        (async (textOrUrlManga, voice, speed, urlData, durationsTs) => {
          try {
            let count_api = await readFileGetValue(),
              $,
              html,
              tickImg = 0,
              strArr = [],
              str = "",
              errArr = [],
              strChar = "->\\/,.>+()_",
              promises = [],
              arrListFileMp3,
              sdfghjkl = 0,
              abcdxyz = 0;

            const TTS = new TextToSpeed(
              textOrUrlManga,
              voice,
              speed,
              urlData,
              durationsTs
            );

            folderExist("file");
            folderExist("error");
            folderExist("pdf");
            folderExist("fixFile");

            const TTP = new TextToPDF();
            const doc = new PDFDocument();

            const instance = axios.create({
              baseURL: "https://api.fpt.ai/hmi/tts/v5",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cache-Control": "no-cache",
                api_key: TTS.API[count_api],
                voice: TTS.voice,
                speed: TTS.speed,
              },
            });

            if (TTS.urlData !== "text") {
              html = await axios.get(encodeURI(textOrUrlManga));
              $ = cheerio.load(html.data);
              let titleQuery = TTP.getTitle(TTS.urlData),
                imgQuery = TTP.getTitle(TTS.urlData, 1),
                getTitle = "",
                imgArr = [];
              if (titleQuery !== null) {
                $(titleQuery).each(
                  (_, d) => (getTitle += $(d).text() + "\n\n")
                );
                if (dialogPathPDF !== null) {
                  doc.pipe(fs.createWriteStream(dialogPathPDF));

                  doc
                    .font(__dirname + "/fonts/arial.ttf")
                    .fontSize(20)
                    .text(getTitle, {
                      align: "center",
                    });

                  $(imgQuery).each((c, d) => {
                    imgArr.push($(d).attr("src"));
                  });

                  for (let x in imgArr) {
                    // await sleep2(2000);
                    await TTP.downloadImg(imgArr[x], x);
                  }

                  if (TTS.urlData === "meobietbay") {
                    await sleep2(1000);
                    doc.image(__dirname + `\\pdf\\${tickImg}.jpg`, {
                      fit: [500, 500],
                      align: "center",
                      valign: "center",
                    });

                    doc.addPage();
                  }
                }
              }
            }

            const handleContent = (e, index, querySelector) => {
              if (str.length < 1500) {
                str += e + " ";
                if (querySelector.length - 1 === index) {
                  strArr.push(str);
                  str = "";
                }
              } else {
                str += e + " ";
                strArr.push(str);
                str = "";
              }
            };

            const getContent = (urlData = "text", v = "") => {
              let querySelector,
                vnArr = null;
              if (urlData === "meobietbay") {
                querySelector = $(
                  "#content .article-content .entry-content > p"
                );
              } else if (urlData === "docln") {
                querySelector = $("#chapter-content > p");
              } else if (urlData === "text") {
                vnArr = v.replace(/\n+/g, "\n").match(/[^\n]*\n|[^\n]+$/g);
                querySelector = vnArr ?? [];
              } else if (urlData === "truyenfull") {
                v = $("#chapter-c").text();
                vnArr = v.replace(/\n+/g, "\n").match(/[^,]*,|[^,]+$/g);
                querySelector = vnArr ?? [];
              }
              const sum = querySelector.length;
              if (sum)
                if (urlData !== "text" && urlData !== "truyenfull") {
                  querySelector.each((a, b) => {
                    if (dialogPathPDF !== null) {
                      let checkImg = $(b).find("img").length;
                      if (checkImg) {
                        let x = 0;
                        while (x >= checkImg) {
                          doc
                            .addPage()
                            .image(__dirname + `\\pdf\\${tickImg}.jpg`, {
                              fit: [500, 600],
                              align: "center",
                              valign: "center",
                            });

                          if (a !== sum - 1 && $(b).next().text().length > 0)
                            doc.addPage();
                          tickImg++;
                          x++;
                        }
                      } else {
                        doc
                          .font(__dirname + "/fonts/arial.ttf")
                          .fontSize(13)
                          .text($(b).text() + "\n\n", {
                            align: "left",
                          });
                      }
                    }
                    handleContent($(b).text(), a, querySelector);
                  });
                } else {
                  if (dialogPathPDF !== null)
                    doc.pipe(fs.createWriteStream(dialogPathPDF));

                  querySelector.forEach((a, b) => {
                    handleContent(a, b, querySelector);

                    doc
                      .font(__dirname + "/fonts/arial.ttf")
                      .fontSize(13)
                      .text(a + "\n\n", {
                        align: "left",
                      });
                  });
                }
            };

            getContent(TTS.urlData, TTS.textOrUrlManga);
            await sleep2(2000);
            if (dialogPathPDF !== null) doc.end();
            //////////////////////////////////////console//////////////////////////////////////////////////
            let totalStrArr = strArr.reduce((x, y) => {
              return x + y.length;
            }, 0);
            console.table({
              textOrUrlManga: TTS.textOrUrlManga,
              voice: TTS.voice,
              speed: TTS.speed,
              urlData: TTS.urlData,
              durationsTs: TTS.durationsTs,
              API: TTS.API.length,
              count_api,
              strArr: strArr.length,
              totalStrArr: totalStrArr,
            });

            if (dialogPath !== null) {
              for (let x in strArr) {
                await sleep2(TTS.durationsTs);
                promises.push(instance.post("", strArr[x]));
                console.log("promises : ", x);
              }
              // let giatrigia = await Promise.any(promises)
              //   .then(
              //     (res) => +res["headers"]["x-ratelimit-remaining-free-month"]
              //   )
              //   .catch((_) => 0);
              // let ratelimit = (giatrigia ??= 0);
              // console.log(ratelimit, giatrigia, count_api);

              const recursionApi = async (params, apiArr, count = 0, ind) => {
                let onon = strChar.charAt(
                  Math.floor(Math.random() * strChar.length)
                );
                if (params.response) {
                  if (
                    (params.response.status === 429 ||
                      params.response.status === 400 ||
                      params.response.status === 502) &&
                    count < apiArr.length
                  ) {
                    console.log(
                      `%c${count}`,
                      "color: #0be881",
                      params.response.status,
                      "recursionApi",
                      ind
                    );
                    const myInterceptor = await instance.interceptors.request.use(
                      (config) => {
                        config.headers["api_key"] = apiArr[count];
                        return config;
                      },
                      (err) => {
                        console.log(err, "interceptors");
                      }
                    );
                    // console.count(ratelimit);
                    // console.count(count);
                    return await instance
                      .post(
                        "",
                        params.config.data +
                          " --- " +
                          onon +
                          onon +
                          onon +
                          " -- "
                      )
                      .then((res) => {
                        // if (count_api === count)
                        //   ratelimit = +res["headers"][
                        //     "x-ratelimit-remaining-free-month"
                        //   ];
                        console.log(
                          `%c${+res["headers"][
                            "x-ratelimit-remaining-free-month"
                          ]}`,
                          "color:red",
                          "count recursionApi :",
                          count
                        );
                        res["count"] = count;
                        return res;
                      })
                      .catch((error) => {
                        instance.interceptors.request.eject(myInterceptor);
                        // if (count_api === count)
                        //   ratelimit -= params.config.data.length;

                        // if (error.config.data.length > ratelimit) ++count;

                        if (count === TTS.API.length - 1) {
                          count = TTS.API.length - 1;
                        } else ++count;

                        return recursionApi(error, apiArr, count);
                      });
                  }
                } else {
                  return { error: params.config.data };
                }
              };

              console.log(promises);

              const promisesRejected = promises.map(
                async (e, ind) =>
                  await e.catch((x) => recursionApi(x, TTS.API, count_api, ind))
              );

              const handlePromiseAll = async (
                promisesRejeced,
                check = true
              ) => {
                return await axios.all(promisesRejeced).then((res) => {
                  console.log(res, "vl luon");
                  let setCountApi = res.map((x) => x?.count).filter((x) => x);
                  let countApiNew = Math.min(...setCountApi);
                  console.log(count_api, countApiNew, setCountApi);
                  console.log(res);

                  if (countApiNew !== Infinity && countApiNew > count_api)
                    processLineByLine(countApiNew);

                  let tzes = +res[res.length - 1]["headers"][
                    "x-ratelimit-remaining-free-month"
                  ];

                  console.log(`%c${tzes}`, "color:red");
                  let cal = tzes + (TTS.API.length - count_api - 1) * 100000;
                  let c_chars = format2(cal);

                  setTimeout(() => {
                    chars.innerHTML = c_chars;
                  }, 500);

                  return res.map((x, y) => {
                    if (x?.error) return { async: "error", error: x.error };
                    return {
                      async: x.data.async,
                      data: x.config.data,
                      index: check === true ? undefined : check[y].index,
                    };
                  });
                });
              };

              const data = await handlePromiseAll(promisesRejected);
              saveValueFile(data, "value");

              // console.log(data);
              errArr = await TTS.getFileMp3(data);

              while (sdfghjkl <= 40) {
                console.log(`%c ${sdfghjkl}`, `color: blue`);
                errArr = await TTS.getFileMp3(errArr, false);

                if (errArr.length) sdfghjkl++;
                else sdfghjkl = 41;
              }
              sdfghjkl = 0;

              const checkError = async () => {
                console.log("--------------------");
                TTS.durationsTs += 3000;
                if (errArr.length) {
                  promises = [];
                  let tempError = [...errArr],
                    promisesErrorRejected = null,
                    cncn = 0,
                    zxzx = strChar.charAt(
                      Math.floor(Math.random() * strChar.length)
                    );

                  for (let x in errArr) {
                    errArr[x].data += " " + zxzx + zxzx + zxzx + " ";
                    await sleep2(TTS.durationsTs);
                    console.log("promises : ", x);
                    promises.push(instance.post("", errArr[x].data));
                  }

                  errArr = [];

                  promisesErrorRejected = promises.map(
                    async (e, ind) =>
                      await e.catch((x) =>
                        recursionApi(x, TTS.API, count_api, ind)
                      )
                  );

                  const dataErrorHandled = await handlePromiseAll(
                    promisesErrorRejected,
                    tempError
                  );

                  errArr = await TTS.getFileMp3(dataErrorHandled);

                  while (cncn <= 40) {
                    console.log(`%c ${cncn}`, `color: blue`);
                    errArr = await TTS.getFileMp3(errArr, false);
                    if (errArr.length) cncn++;
                    else cncn = 41;
                  }

                  if (abcdxyz >= 2) {
                    TTS.durationsTs *= 2;
                    console.log(
                      "turn off APP, your network or server side is bad",
                      TTS.durationsTs
                    );
                  }
                  abcdxyz++;
                  await sleep2(TTS.durationsTs);
                  await checkError();
                }
              };
              await sleep2(2000);
              await checkError();

              arrListFileMp3 = await getListFile("fileMp3");
              await sleep2(2000);

              concatAudio(arrListFileMp3)
                .concat(dialogPath)
                .on("start", function (command) {
                  console.log("ffmpeg process started:", command);
                })
                .on("error", function (err, stdout, stderr) {
                  console.error("Error:", err);
                  console.error("ffmpeg stderr:", stderr);
                })
                .on("end", async () => {
                  let folderNew = await folderExistNew();
                  ///////////////////////////////////////////

                  arrListFileMp3.map((e) => {
                    let newPath = e.replace(
                      /file([^file]*)$/,
                      `fixFile/${folderNew}$1`
                    );

                    fs.rename(
                      e,
                      //remove character end
                      newPath,
                      function (err) {
                        if (err) throw err;
                        console.log("Move complete.");
                      }
                    );
                  });
                  deleteFolder("pdf");
                  // await sleep2(2000);
                  // audioT.controls = true;
                  // mp3Source.src = dialogPath;
                });
            }
            stop = true;
            dialogPath = null;
            dialogPathPDF = null;
          } catch (err) {
            stop = true;
            dialogPath = null;
            dialogPathPDF = null;
            console.log(err, "huydn1");
          }
        })(textOrUrlManga, voice, speed, urlData, durationsTs);
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
