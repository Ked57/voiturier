import { CommandInteraction, GuildMember } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { config, store } from "../app";
import { createCarInitialMessageActionRow } from "../button";
import { postCarInVehicleRunner } from "../vehicle-runner";

export const aCommand = {
  data: new SlashCommandBuilder()
    .setName("a")
    .setDescription(`Ajoute une voiture à la liste`)
    .addStringOption((option) =>
      option.setName("voiture").setDescription("Le modèle de la voiture")
    ),
  execute: async (interaction: CommandInteraction) => {
    if (interaction.channelId !== config.VEHICLE_CHANNEL_ID) {
      console.error("channel", interaction.channelId);
      return;
    }
    const model = interaction.options.get("voiture")?.value;
    if (!model) {
      interaction.reply({
        content: "Il manque le modèle de la voiture",
        ephemeral: true,
      });
      return;
    }
    const modelLabel = String(model);
    const owner = (interaction.member as GuildMember).displayName;
    if (!owner) {
      interaction.reply({
        content: "Le créateur de la commande n'a pas été trouvé",
        ephemeral: true,
      });
      return;
    }
    const reactRow = createCarInitialMessageActionRow();
    const reply = await interaction.reply({
      content: `${modelLabel} - ${owner}`,
      components: [reactRow],
      fetchReply: true,
    });
    const runnerMessageId = await postCarInVehicleRunner(String(model));
    store.mutations.addCar({
      messageId: reply.id,
      model: modelLabel,
      state: "IDLE",
      runnerMessageId,
      for: owner,
    });
  },
};
