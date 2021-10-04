import { Message, MessageEmbed } from "discord.js";
import { config, store } from "./app";
import { getChannel } from "./channel";
import { postMessageInChannel } from "./message";

export const createDailyGlobalCount = async () => {
  const date = new Date().toLocaleDateString("FR-fr", { dateStyle: "full" });
  const messageId = await postMessageInChannel(config.GLOBAL_COUNT_CHANNEL_ID, {
    embeds: [
      new MessageEmbed({ title: date }).setDescription(`Voitures: ${1}
    Chiffre d'affaire: ${2280}$`),
    ],
  });
  store.mutations.upsertDailyCount({
    count: 1,
    messageId: messageId.id,
  });
  console.log("Reset daily global count successfully");
};

export const updateDailyGlobalCount = async (count: number) => {
  let messageId = (await store.getState()).dailyCount?.messageId;
  if (!messageId) {
    await createDailyGlobalCount();
    messageId = (await store.getState()).dailyCount?.messageId;
  }
  if (!messageId) {
    console.error("ERROR: couldn't find dailyCount messageId");
    return;
  }
  const countChannel = await getChannel(config.GLOBAL_COUNT_CHANNEL_ID);
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
  const date = new Date();
  const messageDate = new Date(countMessage.embeds[0].title || "");
  if (date.getHours() >= 2 && messageDate.getDay() !== date.getDay()) {
    await createDailyGlobalCount();
    return;
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
