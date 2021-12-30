const CSVToJSON = require("csvtojson");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const clear = require("clear");
const figlet = require("figlet");

const Spinner = require("cli-spinner").Spinner;
const SPINNER_STRING = "⠋⠙⠹⠸⠼⠴⠦⠧⠏";
const spinner = new Spinner("converting..");
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
    const dataStr = JSON.stringify(data);
    const res = dataStr.replace(/<[^<>]+>/gi, "");

    fs.writeFileSync(
      `${outputPath}/${content}.json`,
      JSON.parse(res),
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

    paths.map(async (item) => {
      const resp = await CSVToJSON({
        ignoreEmpty: true,
        noheader: true,
        headers: headers,
      }).fromFile(`${inputPath + item}.csv`);

      fs.writeFileSync(
        `${outputPath}/${item}.json`,
        JSON.stringify(resp, null, 4),
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
            description: obj[i].description,
            updatedAt: createdAt,
            createdAt: createdAt,
            items: [],
          };

          newArr.push(newObj);
        }
        id = obj[i].oldCaakId;

        newObj.items.push({
          title: obj[i].block_description,
          block_img: obj[i].block_img,
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

      counter = counter + 1;
      console.log(`\r${counter}:${item}.json`);

      if (counter === paths.length) {
        console.log("------Convert Finished------");
        spinner.stop(true);
      }
    });
  } catch (error) {
    spinner.stop(true);
    console.log(error);
  }
})();
