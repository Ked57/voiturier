import { MessageOptions, TextBasedChannels } from "discord.js";
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
