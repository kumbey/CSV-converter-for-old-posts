const CSVToJSON = require("csvtojson");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");

const Spinner = require("cli-spinner").Spinner;
const SPINNER_STRING = "⠋⠙⠹⠸⠼⠴⠦⠧⠏";
// const SPINNER_STRING = "|/-|/-";
const spinner = new Spinner("converting...");
spinner.setSpinnerString(SPINNER_STRING);

const headers = [
  "oldCaakId",
  "title",
  "description",
  "updatedAt",
  "createdAt",
  "block_id",
  "block_title",
  "block_description",
  "block_img",
  "header",
  "footer",
  "block_type",
  "video_provider",
  "video_id",
  "cover_image",
  "brief"
];

const inputPath = "./input/";
const outputPath = "./output";

const getFilePaths = (input) => {
  try {
    const filePaths = fs.readdirSync(input).map((fileName) => {
      return path.join(fileName.replace(".csv", ""));
    });
    return filePaths;
  } catch (error) {
    console.log(error);
  }
};

const htmlTagRemover = (content) => {
  try {

    const data = fs.readFileSync(`${outputPath}/${content}.json`, "utf8");
    const jsonData = JSON.parse(data)

    for(let i=0; i < jsonData.length; i ++){

        const curKeys = Object.keys(jsonData[i])

        if(i === 0){
          console.log(curKeys)
        }

        for(let keysIndex = 0; keysIndex < curKeys.length; keysIndex++){
            const curKey = curKeys[keysIndex]
            if(curKey !== "footer"){
              jsonData[i][curKey] = jsonData[i][curKey].replace(/<[^<>]+>/gi, "")
            }
        }
    }

    const dataStr = JSON.stringify(jsonData);
    // const res = dataStr.replace(/<[^<>]+>/gi, "");

    fs.writeFileSync(
      `${outputPath}/${content}.json`,
      dataStr,
      "utf-8",
      (err) => {
        if (err) {
          throw err;
        }
      }
    );
  } catch (err) {
    console.error(err);
  }
};

(async () => {
  clear();
  let counter = 0;

  console.log(
    chalk.yellow(
      figlet.textSync("CSV to JSON", {
        horizontalLayout: "full",
      })
    )
  );
  console.log("------Convert Started------");

  try {
    const paths = await getFilePaths(inputPath);

    spinner.start();
    for(let pIndex=0; pIndex < paths.length; pIndex++) {
      const item = paths[pIndex]

      if(item !== ".DS_Store"){

        // const readStream=require('fs').createReadStream(`${inputPath + item}.csv`);
        // const writeStream=require("fs").createWriteStream(`${outputPath}/${item}.json`);

        // readStream.pipe(CSVToJSON({
        //   noheader: true,
        //   headers: headers,
        // })).pipe(writeStream);
        
        const resp = await CSVToJSON({
          noheader: true,
          headers: headers,
          output: "json"
        }).fromFile(`${inputPath + item}.csv`)

        fs.writeFileSync(
          `${outputPath}/${item}.json`,
          JSON.stringify(resp),
          "utf-8",
          (err) => {
            if (err) {
              throw err;
            }
          }
        );
    
        await htmlTagRemover(item);
  
        const str = fs.readFileSync(`${outputPath}/${item}.json`, "utf8");
        const obj = JSON.parse(str);
        let newObj = {};
        let newArr = [];
        let id;
        for (let i = 0; i < obj.length; i++) {
          let date = new Date(obj[i].createdAt);
          let createdAt = date.toISOString();


          if (id !== obj[i].oldCaakId) {
            newObj = {
              oldCaakId: obj[i].oldCaakId,
              title: obj[i].title,
              description: `${obj[i].brief}`,
              f_text: obj[i].footer,
              updatedAt: createdAt,
              createdAt: createdAt,
              items: [],
            };
  
            newArr.push(newObj);
          }

          if(i === 0){
            newObj.items.push({
              title: `${obj[i].header}`,
              description: ``,
              block_img: obj[i].cover_image,
              block_type: "image",
              video_provider: obj[i].video_provider,
              video_id: obj[i].video_id
            });
          }

          id = obj[i].oldCaakId;
  
          newObj.items.push({
            title: `${obj[i].block_description}`,
            description: `${obj[i].block_title}`,
            block_img: obj[i].block_img,
            block_type: obj[i].block_type,
            video_provider: obj[i].video_provider,
            video_id: obj[i].video_id
          });
        }
  
        fs.writeFileSync(
          `${outputPath}/${item}.json`,
          JSON.stringify(newArr),
          "utf-8",
          (err) => {
            if (err) {
              throw err;
            }
          }
        );

        console.log(`\r${counter}:${item}.json`);
      }
    }

    console.log("------Convert Finished------");
    spinner.stop(true);

  } catch (error) {
    console.log(error);
    spinner.stop(true);
  }
})();
