import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { config, store } from "../app";
import { createContactRemoveMessageActionRow } from "../button";
import { postContactInVehicleRunner } from "../vehicle-runner";
import { getChannel } from "../channel";

export const handleCommandP = (interaction: CommandInteraction) => {
  const carOption = interaction.options.get("voiture", true);
  if (!carOption || !carOption.message) {
    return;
  }
  interaction.reply(carOption.message.content);
};

export const pCommand = {
  data: new SlashCommandBuilder()
    .setName("p")
    .setDescription(`Ajoute une personne contact`)
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Le nom de la personne contact")
    ),
  execute: async (interaction: CommandInteraction) => {
    if (interaction.channelId !== config.VEHICLE_CHANNEL_ID) {
      return;
    }
    const description = interaction.options.get("description")?.value;
    if (!description) {
      interaction.reply({
        content: "Il manque la description de la personne contact",
        ephemeral: true,
      });
      return;
    }
    const owner = (interaction.member as GuildMember).displayName;
    if (!owner) {
      interaction.reply({
        content: "Le créateur de la commande n'a pas été trouvé",
        ephemeral: true,
      });
      return;
    }
    if (store.state.contact) {
      try {
        (
          await (
            await getChannel(config.VEHICLE_CHANNEL_ID)
          )?.messages.fetch(store.state.contact.vehicleMessageId)
        )?.delete();
        (
          await (
            await getChannel(config.VEHICLE_RUNNER_CHANNEL_ID)
          )?.messages.fetch(store.state.contact.vehicleRunnerMessageId)
        )?.delete();
        store.mutations.setContact();
      } catch (err) {
        console.error(err);
      }
    }
    const descriptionLabel = String(description);
    const reactRow = createContactRemoveMessageActionRow();
    const reply = await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`Personne contact`)
          .setDescription(descriptionLabel)
          .setColor("GREEN"),
      ],
      components: [reactRow],
      fetchReply: true,
    });
    const runnerMessageId = await postContactInVehicleRunner(descriptionLabel);
    store.mutations.setContact({
      description: descriptionLabel,
      vehicleMessageId: reply.id,
      vehicleRunnerMessageId: runnerMessageId,
    });
  },
};
