import { TextBasedChannels } from "discord.js";
import { client } from "./app";

export const getChannel = async (channelId: string) => {
  const channel = await client.channels.fetch(channelId);
  if (!channel) {
    throw new Error("ERROR: Channel doesn't exist or isn't text based");
  }
  return channel as TextBasedChannels;
};
