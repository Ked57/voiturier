import { MessageOptions } from "discord.js";
import { getChannel } from "./channel";

export const postMessageInChannel = async (
  channelId: string,
  message: MessageOptions
) => {
  const channel = await getChannel(channelId);
  if (!channel?.isText()) {
    return Promise.reject(
      "ERROR: Couldn't send message. Channel is not text based"
    );
  }
  return channel.send(message);
};

export const deleteMessageInChannel = async (
  channelId: string,
  messageId: string
) => {
  (await (await getChannel(channelId))?.messages.fetch(messageId))?.delete();
};
