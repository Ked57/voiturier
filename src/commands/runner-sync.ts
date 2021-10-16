import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { config, store } from "../app";
import { createInfoRunnerMessageActionRow } from "../button";
import { getChannel } from "../channel";
import {
  createSelectPlaceSelectMenu,
  createSelectPriceSelectMenu,
} from "../select-menu";

export const runnerSyncCommand = {
  data: new SlashCommandBuilder()
    .setName("runner-sync")
    .setDescription(`Met à jour les compteurs des runners`),
  execute: async (interaction: CommandInteraction) => {
    if (interaction.channelId !== config.INFO_RUNNER_CHANNEL_ID) {
      return;
    }
    const state = await store.getState();
    const infoRunnerChannel = await getChannel(config.INFO_RUNNER_CHANNEL_ID);
    if (!infoRunnerChannel) {
      console.error("info-runner-channel not found");
      return;
    }
    for await (const runner of state.runners) {
      (await infoRunnerChannel.messages.fetch(runner.infoMessageId)).edit({
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
          await createSelectPriceSelectMenu(runner.name, state.prices),
          await createSelectPlaceSelectMenu(runner.name, state.rdvPlaces),
          createInfoRunnerMessageActionRow(),
        ],
      });
      console.log(`Updated runner "${runner.name}" successfully`);
    }
    await interaction.reply({
      ephemeral: true,
      content: "Runners sync successful ✅",
    });
  },
};
