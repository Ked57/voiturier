import { Message } from "discord.js";
import { writeFile, readFile } from "fs/promises";
import fetch from "node-fetch";
import { match } from "ts-pattern";
import { config, store } from "./app";
import { getChannel } from "./channel";

export const saveToDB = async () => {
  match(process.env.NODE_ENV)
    .with("production", async () => {
      try {
        await saveFile(config.DB_MESSAGE_ID);
      } catch (err) {
        console.error("ERROR: Saving db file to Discord -> ", err);
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
        store.mutations.loadState((await getFile()) as any);
      } catch (err) {
        console.error("ERROR: Loading db file from Discord -> ", err);
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

export const saveFile = async (storedMessage?: string) => {
  let message: Message;

  const channel = await getChannel(config.DB_CHANNEL_ID);
  if (!storedMessage) {
    console.error("Saving db file -> No db message found");
    message = await channel.send("db");
    console.log(
      "REMEMBER TO UPDATE ENV VARIABLE DB_MESSAGE_ID WITH",
      message.id
    );
  } else {
    message = await channel.messages.fetch(storedMessage);
    message.removeAttachments();
  }
  message.edit({
    files: [
      {
        attachment: Buffer.from(JSON.stringify(store.state)),
        name: "db.json",
      },
    ],
  });
  return message;
};

export const getFile = async () => {
  console.log("config.DB_MESSAGE_ID", config.DB_MESSAGE_ID);
  const channel = await getChannel(config.DB_CHANNEL_ID);
  let message: Message;
  try {
    message = await channel.messages.fetch(config.DB_MESSAGE_ID);
  } catch (err) {
    console.error("Loading db file -> No db message found", err);
    message = await saveFile();
  }
  return await (
    await fetch((message?.attachments.last()?.toJSON() as any).url as string)
  ).json();
};
