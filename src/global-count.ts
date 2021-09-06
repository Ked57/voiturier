import { Message, MessageEmbed } from "discord.js";
import { config, store } from "./app";
import { getChannel } from "./channel";
import { postMessageInChannel } from "./message";

export const createDailyGlobalCount = async () => {
  const date = new Date().toLocaleDateString("FR-fr", { dateStyle: "full" });
  const messageId = await postMessageInChannel(config.GLOBAL_COUNT_CHANNEL_ID, {
    embeds: [
      new MessageEmbed({ title: date }).setDescription(`Voitures: ${0}
    Chiffre d'affaire: ${0}$`),
    ],
  });
  store.mutations.upsertDailyCount({
    count: 0,
    messageId: messageId.id,
  });
  console.log("Reset daily global count successfully");
};

export const updateDailyGlobalCount = async (count: number) => {
  let messageId = store.state.dailyCount?.messageId;
  if (!messageId) {
    await createDailyGlobalCount();
    messageId = store.state.dailyCount?.messageId;
  }
  if (!messageId) {
    console.error("ERROR: couldn't find dailyCount messageId");
    return;
  }
  const countChannel = getChannel(config.GLOBAL_COUNT_CHANNEL_ID);
  let countMessage = (await countChannel?.messages.fetch())?.find(
    (message) => message.id === messageId
  );
  if (!countMessage) {
    console.error("ERROR: couldn't find dailyCount message");
    countMessage = countChannel?.messages.cache.last();
    if (!countMessage) {
      await createDailyGlobalCount();
    }
    countMessage = countChannel?.messages.cache.last() as Message;
    messageId = countMessage.id;
  }
  await countMessage.edit({
    embeds: [
      new MessageEmbed({
        title: countMessage.embeds[0].title || "",
      }).setDescription(`Voitures: ${count}
      Chiffre d'affaire: ${count * 2280}$`),
    ],
  });
  store.mutations.upsertDailyCount({
    count,
    messageId,
  });
};
