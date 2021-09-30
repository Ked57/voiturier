import { writeFile, readFile } from "fs/promises";
import { match } from "ts-pattern";
import { store } from "./app";
import { getObject } from "./bucket";

export const saveToDB = async () => {
  match(process.env.NODE_ENV)
    .with("production", async () => {
      try {
        // await deleteObject("db.json");
        // await putObject("db.json", store.state);
      } catch (err) {
        console.error("ERROR: Saving db file to S3 -> ", err);
        throw err;
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
    .with("production", async () => {
      try {
        store.mutations.loadState((await getObject("db.json")) as any);
      } catch (err) {
        console.error("ERROR: Loading db file from S3 -> ", err);
        throw err;
      }
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
