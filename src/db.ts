import { writeFile, readFile } from "fs/promises";
import { match } from "ts-pattern";
import { store } from "./app";

export const saveToDB = () => {
  match(process.env.NODE_ENV)
    .with("production", () => {
      // save in S3
    })
    .otherwise(() => {
      try {
        writeFile("./db.json", JSON.stringify(store.state));
      } catch (err) {
        console.error("ERROR: Saving db file to fs -> ", err);
      }
    });
};

export const loadFromDB = () => {
  match(process.env.NODE_ENV)
    .with("production", () => {
      // load from S3
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
