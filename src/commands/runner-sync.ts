import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { config, store } from "../app";
import { getChannel } from "../channel";
import { createRunnerInfoMessageOptions } from "../channels/runner-info";

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
      (await infoRunnerChannel.messages.fetch(runner.infoMessageId)).edit(
        await createRunnerInfoMessageOptions(
          runner,
          state.prices,
          state.rdvPlaces
        )
      );
      console.log(`Updated runner "${runner.name}" successfully`);
    }
    await interaction.reply({
      ephemeral: true,
      content: "Runners sync successfully ✅",
    });
  },
};
