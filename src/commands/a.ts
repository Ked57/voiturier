import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

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
    const reactRow = new MessageActionRow().addComponents([
      new MessageButton().setCustomId("ok").setLabel("Ok").setStyle("SUCCESS"),
      new MessageButton()
        .setCustomId("sell")
        .setLabel("Vendre")
        .setStyle("SECONDARY"),
      new MessageButton()
        .setCustomId("delete")
        .setLabel("Supprimer")
        .setStyle("DANGER"),
    ]);
    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(`${interaction.options.get("voiture")?.value}`);
    await interaction.reply({ embeds: [embed], components: [reactRow] });
  },
};
