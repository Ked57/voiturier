import { ButtonInteraction, GuildMember, MessageEmbed } from "discord.js";
import { config, store } from "../app";
import { createInfoRunnerMessageActionRow } from "../button";
import { getChannel } from "../channel";
import {
  createSelectPlaceSelectMenu,
  createSelectPriceSelectMenu,
} from "../select-menu";
import { Runner } from "../store";

export const createRunnerInfoMessageOptions = async (
  runner: Runner,
  prices: number[],
  rdvPlaces: string[]
) => ({
  embeds: [
    new MessageEmbed()
      .setTitle(String(runner.name))
      .setColor("GREEN")
      .setFields(
        {
          name: "Téléphone",
          value: runner.phoneNumber,
          inline: true,
        },
        {
          name: "Prix",
          value: `${runner.price}$`,
          inline: true,
        },
        {
          name: "Livraison",
          value: `${runner.rdvPlace}`,
          inline: true,
        },
        {
          name: "Compteur",
          value: `${runner.count.ongoing}`,
          inline: true,
        },
        {
          name: "Total",
          value: `${runner.count.total}`,
          inline: true,
        },
        {
          name: "A payer",
          value: `${runner.count.ongoing * (runner.price || 0)}$`,
          inline: true,
        }
      ),
  ],
  components: [
    await createSelectPriceSelectMenu(runner.name, prices),
    await createSelectPlaceSelectMenu(runner.name, rdvPlaces),
    createInfoRunnerMessageActionRow(),
  ],
});

export const deleteRunner = async (interaction: ButtonInteraction) => {
  const messageId = interaction.message.id;
  const runner = (await store.getState()).runners.find(
    (runner) =>
      runner.countMessageId === messageId || runner.infoMessageId === messageId
  );
  if (!runner) {
    interaction.reply({ content: "Runner inconnu", ephemeral: true });
    return;
  }
  const countChannel = await getChannel(config.COUNT_RUNNER_CHANNEL_ID);
  await (await countChannel.messages.fetch(runner.countMessageId))?.delete();
  const infoChannel = await getChannel(config.INFO_RUNNER_CHANNEL_ID);
  await (await infoChannel.messages.fetch(runner.infoMessageId))?.delete();
  await store.mutations.removeRunner(runner);
  console.log(
    `${(interaction.member as GuildMember).displayName} deleted runner ${
      runner.name
    }`
  );
};

export const updateRunnerInfoMessage = async (
  runner: Runner,
  prices: number[],
  rdvPlaces: string[]
) => {
  const infoChannel = await getChannel(config.INFO_RUNNER_CHANNEL_ID);
  await (
    await infoChannel.messages.fetch(runner.infoMessageId)
  )?.edit(await createRunnerInfoMessageOptions(runner, prices, rdvPlaces));
};
