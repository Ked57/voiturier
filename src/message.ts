import { MessageOptions, TextBasedChannels } from "discord.js";
import { client } from "./app";

export const postMessageInChannel = (
  channelId: string,
  message: MessageOptions
) => {
  const channel = client.channels.cache.get(channelId);
  if (!channel?.isText()) {
    return Promise.reject(
      "ERROR: Couldn't send message. Channel is not text based"
    );
  }
  return channel.send(message);
};
