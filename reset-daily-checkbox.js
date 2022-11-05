import { Client } from "@notionhq/client";
import fetch from "node-fetch";
import "dotenv";
import * as fs from "fs"
const TOKEN = process.env.INTEGRATION_SECRET;
const notion = new Client({
  auth: TOKEN,
});

const databaseId = process.env.DBID;
(async () => {

  const response = await notion.databases.query({
    database_id: databaseId,
    // apply filters
    filter: {
      and: [
        {
          property: "Duration in Days",
          formula: {
            number: {
              greater_than: 1,
            },
          },
        },
        {
          property: "Status",
          select: {
            equals: "Done",
          },
        },
        {
          property: "Todo Today",
          formula: {
            checkbox: {
              equals: true,
            },
          },
        },
      ],
    },
    sorts: [
      {
        property: "Created",
        direction: "ascending",
      },
    ],
  });

  // get pageIds
  const pageIds = response.results
    .map((page) => page.id)
    .filter((pageId) => pageId !== null);

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
          Status: {
            select: {
              id: "6959c130-689e-49c3-9891-03290e5f7c70",
              name: "Todo",
              color: "pink",
            },
            type: "select",
          },
        },
      }),
    };

    // update the page
    fetch("https://api.notion.com/v1/pages/" + pageId + "", options);
    /*.then((response) => response.json())
      .then((response) => console.log(response))
      .catch((err) => console.error(err));*/
  });

  // log script output
  let logs = [];
  logs = JSON.parse(fs.readFileSync("./log.json", 'utf8'));
  logs.push({
    timestamp: Date.now(),
    pageIds: pageIds,
    amount: pageIds.length,
    name: "reset-daily-checkbox",
    owner: "Ralf Boltshauser",
  });
  fs.writeFile("/home/pi/functions/notion/log.json", JSON.stringify(logs), err => {
    console.log(err);
  });
  console.log(logs);
})();
