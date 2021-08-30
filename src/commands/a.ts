import {
  CommandInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { config, store } from "../app";
import { createCarInitialMessageActionRow } from "../button";
import { createCarInitialEmbed } from "../embed";
import { postInVehicleRunner } from "../vehicle-runner";

export const handleCommandA = (interaction: CommandInteraction) => {
  const carOption = interaction.options.get("voiture", true);
  if (!carOption || !carOption.message) {
    return;
  }
  interaction.reply(carOption.message.content);
};

export const aCommand = {
  data: new SlashCommandBuilder()
    .setName("a")
    .setDescription(`Ajoute une voiture à la liste`)
    .addStringOption((option) =>
      option.setName("voiture").setDescription("Le modèle de la voiture")
    ),
  execute: async (interaction: CommandInteraction) => {
    if (interaction.channelId !== config.VEHICLE_CHANNEL_ID) {
      interaction.reply({
        content: "La commande n'a pas été éxécutée dans le bon channel",
        ephemeral: true,
      });
      return;
    }
    const model = interaction.options.get("voiture")?.value;
    if (!model) {
      return;
    }
    const modelLabel = String(model);
    const reactRow = createCarInitialMessageActionRow();
    const embed = createCarInitialEmbed(
      modelLabel,
      (interaction.member as GuildMember).displayName || ""
    );
    const reply = await interaction.reply({
      embeds: [embed],
      components: [reactRow],
      fetchReply: true,
    });
    const runnerMessageId = await postInVehicleRunner(String(model));
    store.mutations.addCar({
      messageId: reply.id,
      model: modelLabel,
      state: "IDLE",
      runnerMessageId,
    });
  },
};
