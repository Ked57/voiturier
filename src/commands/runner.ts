import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { config, store } from "../app";
import {
  createCountRunnerMessageActionRow,
  createInfoRunnerMessageActionRow,
} from "../button";
import { postMessageInChannel } from "../message";
import {
  createSelectPlaceSelectMenu,
  createSelectPriceSelectMenu,
} from "../select-menu";
import { Runner } from "../store";

export const runnerCommand = {
  data: new SlashCommandBuilder()
    .setName("runner")
    .setDescription(`Ajoute un runner`)
    .addStringOption((option) =>
      option.setName("nom").setDescription("Le nom du runner")
    )
    .addStringOption((option) =>
      option.setName("téléphone").setDescription("Le numéro de téléphone")
    ),
  execute: async (interaction: CommandInteraction) => {
    if (interaction.channelId !== config.INFO_RUNNER_CHANNEL_ID) {
      return;
    }
    const name = interaction.options.get("nom")?.value;
    if (!name) {
      interaction.reply({
        content: "Il manque le nom du runner",
        ephemeral: true,
      });
      return;
    }
    const phoneNumber = interaction.options.get("téléphone")?.value;
    if (!phoneNumber) {
      interaction.reply({
        content: "Il manque le numéro de téléphone du runner",
        ephemeral: true,
      });
      return;
    }
    const state = await store.getState();
    const countMessage = await postMessageInChannel(
      config.COUNT_RUNNER_CHANNEL_ID,
      {
        embeds: [
          new MessageEmbed()
            .setTitle(String(name))
            .setColor("GREEN")
            .setFields(
              { name: "Téléphone", value: String(phoneNumber), inline: true },
              { name: "Compteur", value: `${0}`, inline: true }
            ),
        ],
        components: [createCountRunnerMessageActionRow()],
      }
    );
    const infoMessage = await interaction.reply({
      fetchReply: true,
      embeds: [
        new MessageEmbed()
          .setTitle(String(name))
          .setColor("GREEN")
          .setFields(
            { name: "Téléphone", value: String(phoneNumber), inline: true },
            { name: "Prix", value: `${0}$`, inline: true },
            { name: "Livraison", value: "Non définie", inline: true },
            { name: "Compteur", value: `${0}`, inline: true },
            { name: "Total", value: `${0}`, inline: true },
            {
              name: "A payer",
              value: `${0}$`,
              inline: true,
            }
          ),
      ],
      components: [
        await createSelectPriceSelectMenu(String(name), state.prices),
        await createSelectPlaceSelectMenu(String(name), state.rdvPlaces),
        createInfoRunnerMessageActionRow(),
      ],
    });
    const runner: Runner = {
      name: String(name),
      countMessageId: countMessage.id,
      infoMessageId: infoMessage.id,
      phoneNumber: String(phoneNumber),
      count: {
        ongoing: 0,
        total: 0,
      },
    };
    store.mutations.upsertRunner(runner);

    console.log(
      `${(interaction.member as GuildMember).displayName} added runner "${
        runner.name
      }"`
    );
  },
};
