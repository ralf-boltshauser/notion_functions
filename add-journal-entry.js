import { Client } from "@notionhq/client";
import fetch from "node-fetch";
import "dotenv";
import * as fs from "fs"
const TOKEN = process.env.INTEGRATION_SECRET_AJE;
const notion = new Client({
  auth: TOKEN,
});

const databaseId = process.env.DBID_AJE;
(async () => {

  // loop over pages
  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Notion-Version": "2021-08-16",
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({
      parent: {
        type: "database_id",
        database_id: databaseId
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: new Date().toISOString().split("T")[0]
              }
            }
          ]
        }
      },
    }),
  };

  // update the page
  fetch("https://api.notion.com/v1/pages/", options);
  /*.then((response) => response.json())
    .then((response) => console.log(response))
    .catch((err) => console.error(err));*/

  // log script output
  let logs = [];
  logs = JSON.parse(fs.readFileSync("/home/pi/functions/notion/log.json", 'utf8'));
  logs.push({
    timestamp: Date.now(),
    name: "add-journal-entry",
    owner: "Ralf Boltshauser",
  });
  fs.writeFile("/home/pi/functions/notion/log.json", JSON.stringify(logs), err => {
    console.log(err);
  });
  console.log(logs);
})();
