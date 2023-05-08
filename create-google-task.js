// convert requires to imports
import { promises as fs } from "fs";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/tasks"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const TASK_LIST_ID = process.env.DAILY_TASK_LIST_ID;

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Creates a task in the specified task list.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {string} taskListId The ID of the task list to add the task to.
 * @param {string} taskTitle The title of the task to create.
 * @param {string} taskNotes (optional) Additional notes for the task.
 * @return {Promise<void>}
 */
async function createTask(auth, taskListId, taskTitle, taskNotes = "") {
  const service = google.tasks({ version: "v1", auth });

  const task = {
    title: taskTitle,
    notes: taskNotes,
    due: new Date().toISOString(),
  };
  await service.tasks.insert({ tasklist: taskListId, resource: task });
  console.log(`Task '${taskTitle}' created in task list ${taskListId}.`);
}
async function addDailyTask(title, notes = "") {
  console.log("Task lists:");
  authorize()
    .then(async (auth) => {
      await createTask(auth, TASK_LIST_ID, title, notes);
    })
    .catch(console.error);
}

export { addDailyTask };
