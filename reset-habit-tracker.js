import { Client } from "@notionhq/client";
import fetch from "node-fetch";
import "dotenv";
import * as fs from "fs"
const TOKEN = process.env.YANICK_INTEGRATION_SECRET;
const notion = new Client({
  auth: TOKEN,
});

const databaseId = process.env.HABIT_TRACKER_DBID;
(async () => {

  const response = await notion.databases.query({
    database_id: databaseId,
  });

  // get pageIds
  let pageIds = response.results
    .map((page) => page.id)
    .filter((pageId) => pageId !== null);
  console.log(response.results[0].properties);


  // loop over pages
  pageIds.forEach(async (pageId) => {
    const options = {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Notion-Version": "2021-08-16",
        "Content-Type": "application/json",
        Authorization: "Bearer " + TOKEN,
      },
      body: JSON.stringify({
        properties: {
          Monday: {
            checkbox: false,
            type: 'checkbox',
          },
          Tuesday: {
            checkbox: false,
            type: "checkbox",
          },
          Wednesday: {
            checkbox: false,
            type: "checkbox",
          },
          Thursday: {
            checkbox: false,
            type: "checkbox",
          },
          Friday: {
            checkbox: false,
            type: "checkbox",
          },
          Saturday: {
            checkbox: false,
            type: "checkbox",
          },
          Sunday: {
            checkbox: false,
            type: "checkbox",
          },
        },

      }),
    };

    // update the page
    fetch("https://api.notion.com/v1/pages/" + pageId, options).then((data) => {
      console.log(data);
    }, (error) => {
      console.log(error);
    });
  });

  // log script output
  let logs = [];
  logs = JSON.parse(fs.readFileSync("/home/pi/functions/notion/log.json", 'utf8'));
  logs.push({
    timestamp: Date.now(),
    pageIds: pageIds,
    amount: pageIds.length,
    name: "reset-habit-tracker",
    owner: "Yanick Christen",
  });
  fs.writeFile("/home/pi/functions/notion/log.json", JSON.stringify(logs), err => {
    console.log(err);
  });
})();
