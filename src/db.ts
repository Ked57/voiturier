import { Message } from "discord.js";
import { writeFile, readFile } from "fs/promises";
import fetch from "node-fetch";
import { match } from "ts-pattern";
import { config, store } from "./app";
import { getChannel } from "./channel";

export const saveToDB = async () => {
  try {
    await saveFile();
  } catch (err) {
    console.error("ERROR: Saving db file to Discord -> ", err);
    throw err;
  }
};

export const loadFromDB = async () => {
  try {
    store.mutations.loadState((await getFile()) as any);
  } catch (err) {
    console.error("ERROR: Loading db file from Discord -> ", err);
    throw err;
  }
};

export const saveFile = async () => {
  let message: Message;

  const channel = await getChannel(config.DB_CHANNEL_ID);
  if (typeof channel.lastMessageId !== "string") {
    console.error("Saving db file -> No db message found");
    message = await channel.send("db");
  } else {
    try {
      message = await channel.messages.fetch(channel.lastMessageId);
    } catch (err) {
      console.error("Saving db file -> No db message found");
      message = await channel.send("db");
    }
    message.removeAttachments();
  }
  await message.edit({
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
  const channel = await getChannel(config.DB_CHANNEL_ID);
  let message: Message;
  try {
    message = await channel.messages.fetch(channel.lastMessageId as string);
  } catch (err) {
    console.error("Loading db file -> No db message found", err);
    message = await saveFile();
  }
  return await (
    await fetch((message?.attachments.last()?.toJSON() as any).url as string)
  ).json();
};
