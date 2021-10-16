import { ButtonInteraction, GuildMember, MessageEmbed } from "discord.js";
import { config, store } from "../app";
import { getChannel } from "../channel";
import { Runner } from "../store";
import { updateRunnerInfoMessage } from "./runner-info";

export const createRunnerCountMessageOptions = (runner: Runner) => ({
  embeds: [
    new MessageEmbed()
      .setTitle(runner.name)
      .setColor("GREEN")
      .setFields(
        {
          name: "Téléphone",
          value: runner.phoneNumber,
          inline: true,
        },
        {
          name: "Compteur",
          value: `${runner.count.ongoing}`,
          inline: true,
        }
      ),
  ],
});

export const updateRunnerCountMessage = async (runner: Runner) => {
  const countChannel = await getChannel(config.COUNT_RUNNER_CHANNEL_ID);
  await (
    await countChannel.messages.fetch(runner.countMessageId)
  )?.edit(createRunnerCountMessageOptions(runner));
};

export const resetRunnerCount = async (interaction: ButtonInteraction) => {
  const state = await store.getState();
  const messageId = interaction.message.id;
  const runner = state.runners.find(
    (runner) =>
      runner.countMessageId === messageId || runner.infoMessageId === messageId
  );
  if (!runner) {
    interaction.reply({ content: "Runner inconnu" });
    return;
  }
  const updatedRunner = await store.mutations.upsertRunner({
    ...runner,
    count: { ...runner.count, ongoing: 0 },
  });

  if (!updatedRunner) {
    interaction.reply({ content: "Runner inconnu", ephemeral: true });
    return;
  }
  await updateRunnerCountMessage(updatedRunner);
  await updateRunnerInfoMessage(updatedRunner, state.prices, state.rdvPlaces);
  console.log(
    `${(interaction.member as GuildMember).displayName} reset runner ${
      runner.name
    }'s count`
  );
};

export const decrementRunnerCount = async (interaction: ButtonInteraction) => {
  const messageId = interaction.message.id;
  const state = await store.getState();
  const runner = state.runners.find(
    (runner) =>
      runner.countMessageId === messageId || runner.infoMessageId === messageId
  );
  if (!runner) {
    interaction.reply({ content: "Runner inconnu" });
    return;
  }
  const updatedRunner = await store.mutations.upsertRunner({
    ...runner,
    count: {
      ongoing: runner.count.ongoing - 1,
      total: runner.count.total - 1,
    },
  });

  if (!updatedRunner) {
    interaction.reply({ content: "Runner inconnu" });
    return;
  }
  await updateRunnerCountMessage(updatedRunner);
  await updateRunnerInfoMessage(updatedRunner, state.prices, state.rdvPlaces);
  console.log(
    `${(interaction.member as GuildMember).displayName} decremented runner ${
      runner.name
    }'s counter`
  );
};

export const incrementRunnerCount = async (interaction: ButtonInteraction) => {
  const messageId = interaction.message.id;
  const state = await store.getState();
  const runner = state.runners.find(
    (runner) =>
      runner.countMessageId === messageId || runner.infoMessageId === messageId
  );
  if (!runner) {
    interaction.reply({ content: "Runner inconnu" });
    return;
  }
  const updatedRunner = await store.mutations.upsertRunner({
    ...runner,
    count: {
      ongoing: runner.count.ongoing + 1,
      total: runner.count.total + 1,
    },
  });

  if (!updatedRunner) {
    interaction.reply({ content: "Runner inconnu" });
    return;
  }
  await updateRunnerCountMessage(updatedRunner);
  await updateRunnerInfoMessage(updatedRunner, state.prices, state.rdvPlaces);
  console.log(
    `${(interaction.member as GuildMember).displayName} incremented runner ${
      runner.name
    }'s counter`
  );
};
