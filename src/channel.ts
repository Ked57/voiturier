import { client } from "./app";

export const getChannel = (channelId: string) => {
  const channel = client.channels.cache.get(channelId);
  if (!channel || !channel.isText()) {
    console.error("ERROR: Channel doesn't exist or isn't text based");
    return;
  }
  return channel;
};
