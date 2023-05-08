import { Client } from "@notionhq/client";
import fetch from "node-fetch";
import "dotenv";
import * as fs from "fs";
const TOKEN = process.env.INTEGRATION_SECRET_AJE;
const notion = new Client({
  auth: TOKEN,
});
const notionClientBaseUrl = "https://www.notion.so/ralfboltshauser";

import { addDailyTask } from "./create-google-task.js";

const databaseId = process.env.DBID_AJE;
(async () => {
  // loop over pages
  // const options = {
  //   method: "POST",
  //   headers: {
  //     Accept: "application/json",
  //     "Notion-Version": "2021-08-16",
  //     "Content-Type": "application/json",
  //     Authorization: "Bearer " + TOKEN,
  //   },
  //   body: JSON.stringify({
  //     parent: {
  //       type: "database_id",
  //       database_id: databaseId,
  //     },
  //     properties: {
  //       Name: {
  //         title: [
  //           {
  //             text: {
  //               content: new Date().toISOString().split("T")[0],
  //             },
  //           },
  //         ],
  //       },
  //     },
  //   }),
  // };
  const dateString = new Date().toISOString().split("T")[0];
  const options = {
    parent: {
      type: "database_id",
      database_id: databaseId,
    },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: dateString,
            },
          },
        ],
      },
    },
  };

  // update the page
  const res = await notion.pages.create(options);

  const pageUrl = "https://notion.so/" + res.id.replace(/-/g, "");

  console.log(pageUrl);

  addDailyTask("Fill out daily journal (Morning)", pageUrl);
  addDailyTask("Fill out daily journal (Evening)", pageUrl);

  let logs = [];
  try {
    logs = JSON.parse(
      fs.readFileSync("/home/pi/functions/notion/log.json", "utf8")
    );
    logs.push({
      timestamp: Date.now(),
      name: "add-journal-entry",
      owner: "Ralf Boltshauser",
    });
    fs.writeFile(
      "/home/pi/functions/notion/log.json",
      JSON.stringify(logs),
      (err) => {
        console.log(err);
      }
    );
  } catch (err) {}
  console.log(logs);
})();
