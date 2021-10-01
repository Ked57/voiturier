import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  GuildMember,
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
} from "discord.js";
import { config, store } from "../app";
import {
  createCountRunnerMessageActionRow,
  createInfoRunnerMessageActionRow,
} from "../button";
import { postMessageInChannel } from "../message";
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
    if (
      interaction.channelId !== config.COUNT_RUNNER_CHANNEL_ID &&
      interaction.channelId !== config.INFO_RUNNER_CHANNEL_ID
    ) {
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
    const selectPrice = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("runner_price")
        .setPlaceholder("Prix")
        .addOptions(
          {
            label: `0$`,
            value: `${name}/0`,
          },
          ...store.state.prices.map((price) => ({
            label: `${price}$`,
            value: `${name}/${price}`,
          }))
        )
    );
    const selectPlace = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("runner_place")
        .setPlaceholder("Livraison")
        .addOptions(
          {
            label: `Non définit`,
            value: `${name}/`,
          },
          ...store.state.rdvPlaces.map((place) => ({
            label: `${place}`,
            value: `${name}/${place}`,
          }))
        )
    );
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
    const infoMessage = await postMessageInChannel(
      config.INFO_RUNNER_CHANNEL_ID,
      {
        embeds: [
          new MessageEmbed()
            .setTitle(String(name))
            .setColor("GREEN")
            .setFields(
              { name: "Téléphone", value: String(phoneNumber), inline: true },
              { name: "Prix", value: `${0}$`, inline: true },
              { name: "Livraison", value: "Non définie", inline: true },
              { name: "Compteur", value: `${0}`, inline: true },
              { name: "Total", value: `${0}`, inline: true }
            ),
        ],
        components: [
          selectPrice,
          selectPlace,
          createInfoRunnerMessageActionRow(),
        ],
      }
    );
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
  },
};
