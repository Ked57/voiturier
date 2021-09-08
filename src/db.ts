
import { writeFile, readFile } from "fs/promises";
import { match } from "ts-pattern";
import { config, store } from "./app";
global.fetch = fetch as any;

export const saveToDB = async () => {
  match(process.env.NODE_ENV)
    .with("production", async () => {
      try {
        // writeFile("./db.json", JSON.stringify(store.state));
      } catch (err) {
        console.error("ERROR: Saving db file to fs -> ", err);
      }
    })
    .otherwise(() => {
      try {
        writeFile("./db.json", JSON.stringify(store.state));
      } catch (err) {
        console.error("ERROR: Saving db file to fs -> ", err);
      }
    });
};

export const loadFromDB = async () => {
  match(process.env.NODE_ENV)
    .with("production", () => {
      // load from S3
      console.log("WRONG ENV");
    })
    .otherwise(async () => {
      try {
        store.mutations.loadState(
          JSON.parse((await readFile("./db.json")).toString())
        );
      } catch (err) {
        console.error("ERROR: Loading db file from fs -> ", err);
      }
    });
};
