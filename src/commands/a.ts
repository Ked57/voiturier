import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { store } from "../app";

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
    const model = interaction.options.get("voiture")?.value;
    if (!model) {
      return;
    }
    const modelLabel = String(model);
    const reactRow = new MessageActionRow().addComponents([
      new MessageButton()
        .setCustomId("found")
        .setLabel("Marquer ✅")
        .setStyle("SUCCESS"),
      new MessageButton()
        .setCustomId("delete")
        .setLabel("Supprimer ❌")
        .setStyle("DANGER"),
    ]);
    const embed = new MessageEmbed().setColor("#0099ff").setTitle(modelLabel);
    const reply = await interaction.reply({
      embeds: [embed],
      components: [reactRow],
      fetchReply: true,
    });
    store.mutations.addCar({
      messageId: reply.id,
      model: modelLabel,
      state: "IDLE",
    });
  },
};
