import {
  ButtonInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { match } from "ts-pattern";
import { config, store } from "./app";
import { getChannel } from "./channel";
import { updateDailyGlobalCount } from "./global-count";

export const createCarInitialMessageActionRow = () =>
  new MessageActionRow().addComponents([
    new MessageButton()
      .setCustomId("found")
      .setLabel("Marquer ✅")
      .setStyle("SUCCESS"),
    new MessageButton()
      .setCustomId("delete")
      .setLabel("Supprimer ❌")
      .setStyle("DANGER"),
  ]);

export const createRunnerCarInitialMessageActionRow = () =>
  new MessageActionRow().addComponents([
    new MessageButton()
      .setCustomId("found")
      .setLabel("Marquer ✅")
      .setStyle("SUCCESS"),
  ]);

export const createCarFoundMessageActionRow = () =>
  new MessageActionRow().addComponents([
    new MessageButton()
      .setCustomId("lost")
      .setLabel("Démarquer 🤬")
      .setStyle("PRIMARY"),
    new MessageButton()
      .setCustomId("sell")
      .setLabel("Vendre 💰")
      .setStyle("SECONDARY"),
    new MessageButton()
      .setCustomId("delete")
      .setLabel("Supprimer ❌")
      .setStyle("DANGER"),
  ]);

export const createRunnerCarFoundMessageActionRow = () =>
  new MessageActionRow().addComponents([
    new MessageButton()
      .setCustomId("lost")
      .setLabel("Démarquer 🤬")
      .setStyle("PRIMARY"),
  ]);

export const createContactRemoveMessageActionRow = () =>
  new MessageActionRow().addComponents([
    new MessageButton()
      .setCustomId("delete-contact")
      .setLabel("Supprimer ❌")
      .setStyle("DANGER"),
  ]);

export const createCountRunnerMessageActionRow = () =>
  new MessageActionRow().addComponents([
    new MessageButton()
      .setCustomId("plus-one-runner")
      .setLabel("+1 ➕")
      .setStyle("PRIMARY"),
    new MessageButton()
      .setCustomId("minus-one-runner")
      .setLabel("-1 ➖")
      .setStyle("PRIMARY"),
    new MessageButton()
      .setCustomId("new-runner")
      .setLabel("New 🆕")
      .setStyle("PRIMARY"),
  ]);
export const createInfoRunnerMessageActionRow = () =>
  new MessageActionRow().addComponents([
    new MessageButton()
      .setCustomId("delete-runner")
      .setLabel("Supprimer ❌")
      .setStyle("DANGER"),
  ]);

export const handleButton = async (interaction: ButtonInteraction) => {
  if (!interaction.isButton()) return;
  match(interaction.customId)
    .with("found", async () => {
      const foundBy = (interaction.member as GuildMember).displayName;
      if (!foundBy) {
        console.error(
          "ERROR: Clicking 'found' button -> Unknown display user",
          interaction.message.id
        );
        return;
      }
      const car = (await store.getState()).cars.find(
        (car) =>
          car.messageId === interaction.message.id ||
          car.runnerMessageId === interaction.message.id
      );
      if (!car) {
        console.error(
          "ERROR: Clicking 'found' button -> Couldn't find car with messageId or runnerMessageId",
          interaction.message.id
        );
        return;
      }
      await store.mutations.updateCarState(
        interaction.message.id,
        "FOUND",
        foundBy
      );
      try {
        const vehicleMessage = (
          await (await getChannel(config.VEHICLE_CHANNEL_ID))?.messages.fetch()
        )?.find((message) => message.id === car.messageId);
        const vehicleRunnerMessage = (
          await (
            await getChannel(config.VEHICLE_RUNNER_CHANNEL_ID)
          )?.messages.fetch()
        )?.find((message) => message.id === car.runnerMessageId);
        await vehicleMessage?.edit({
          components: [createCarFoundMessageActionRow()],
          content: `${car.model} - ${car.for} - **${foundBy}** ✅`,
        });
        await vehicleRunnerMessage?.edit({
          components: [createRunnerCarFoundMessageActionRow()],
          content: `${car.model} ✅`,
        });
      } catch (err) {
        console.error("ERROR: Trying to interact with found button", err);
      }
    })
    .with("lost", async () => {
      const car = (await store.getState()).cars.find(
        (car) =>
          car.messageId === interaction.message.id ||
          car.runnerMessageId === interaction.message.id
      );
      if (!car) {
        console.error(
          "ERROR: Clicking 'lost' button -> Couldn't find car with messageId or runnerMessageId",
          interaction.message.id
        );
        return;
      }
      await store.mutations.updateCarState(interaction.message.id, "IDLE");
      try {
        const vehicleMessage = (
          await (await getChannel(config.VEHICLE_CHANNEL_ID))?.messages.fetch()
        )?.find((message) => message.id === car.messageId);
        const vehicleRunnerMessage = (
          await (
            await getChannel(config.VEHICLE_RUNNER_CHANNEL_ID)
          )?.messages.fetch()
        )?.find((message) => message.id === car.runnerMessageId);
        await vehicleMessage?.edit({
          components: [createCarInitialMessageActionRow()],
          content: `${car.model} - ${car.for}`,
        });
        await vehicleRunnerMessage?.edit({
          components: [createRunnerCarInitialMessageActionRow()],
          content: `${car.model}`,
        });
      } catch (err) {
        console.error("ERROR: Trying to interact with lost button", err);
      }
    })
    .with("sell", async () => {
      const car = (await store.getState()).cars.find(
        (car) => car.messageId === interaction.message.id
      );
      if (!car) {
        console.error(
          "ERROR: Clicking 'sell' button -> Couldn't find car with messageId",
          interaction.message.id
        );
        return;
      }
      try {
        (
          await (
            await getChannel(config.VEHICLE_CHANNEL_ID)
          )?.messages.fetch(car.messageId)
        )?.delete();
        (
          await (
            await getChannel(config.VEHICLE_RUNNER_CHANNEL_ID)
          )?.messages.fetch(car.runnerMessageId)
        )?.delete();

        await store.mutations.sellCar(car.messageId);
        await store.mutations.removeCar(car.messageId);
        await updateDailyGlobalCount(
          (await store.getState()).dailyCount?.count || 1
        );
      } catch (err) {
        console.error(err);
      }
    })
    .with("delete", async () => {
      const car = (await store.getState()).cars.find(
        (car) => car.messageId === interaction.message.id
      );
      if (!car) {
        console.error(
          "ERROR: Clicking 'delete' button -> Couldn't find car with messageId",
          interaction.message.id
        );
        return;
      }
      try {
        (
          await (
            await getChannel(config.VEHICLE_CHANNEL_ID)
          )?.messages.fetch(car.messageId)
        )?.delete();
        (
          await (
            await getChannel(config.VEHICLE_RUNNER_CHANNEL_ID)
          )?.messages.fetch(car.runnerMessageId)
        )?.delete();
        await store.mutations.removeCar(car.messageId);
      } catch (err) {
        console.error(err);
      }
    })
    .with("delete-contact", async () => {
      if (!(await store.getState()).contact) {
        console.error("ERROR: Trying to remove contact -> contact not found");
        return;
      }
      try {
        (
          await (
            await getChannel(config.VEHICLE_CHANNEL_ID)
          )?.messages.fetch(
            (await store.getState()).contact?.vehicleMessageId || ""
          )
        )?.delete();
        (
          await (
            await getChannel(config.VEHICLE_RUNNER_CHANNEL_ID)
          )?.messages.fetch(
            (await store.getState()).contact?.vehicleRunnerMessageId || ""
          )
        )?.delete();
        await store.mutations.setContact();
      } catch (err) {
        console.error(err);
      }
    })
    .with("plus-one-runner", async () => {
      const messageId = interaction.message.id;
      const runner = (await store.getState()).runners.find(
        (runner) =>
          runner.countMessageId === messageId ||
          runner.infoMessageId === messageId
      );
      if (!runner) {
        interaction.reply({ content: "Runner inconnu", ephemeral: true });
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
      const countChannel = await getChannel(config.COUNT_RUNNER_CHANNEL_ID);
      await countChannel.messages.cache
        .get(updatedRunner.countMessageId)
        ?.edit({
          embeds: [
            new MessageEmbed()
              .setTitle(updatedRunner.name)
              .setColor("GREEN")
              .setFields(
                {
                  name: "Téléphone",
                  value: updatedRunner.phoneNumber,
                  inline: true,
                },
                {
                  name: "Compteur",
                  value: `${updatedRunner.count.ongoing}`,
                  inline: true,
                }
              ),
          ],
        });
      const infoChannel = await getChannel(config.INFO_RUNNER_CHANNEL_ID);
      await (
        await infoChannel.messages.fetch(updatedRunner.infoMessageId)
      )?.edit({
        embeds: [
          new MessageEmbed()
            .setTitle(updatedRunner.name)
            .setColor("GREEN")
            .setFields(
              {
                name: "Téléphone",
                value: updatedRunner.phoneNumber,
                inline: true,
              },
              { name: "Prix", value: `${updatedRunner.price}$`, inline: true },
              {
                name: "Livraison",
                value: `${updatedRunner.rdvPlace}`,
                inline: true,
              },
              {
                name: "Compteur",
                value: `${updatedRunner.count.ongoing}`,
                inline: true,
              },
              {
                name: "Total",
                value: `${updatedRunner.count.total}`,
                inline: true,
              },
              {
                name: "A payer",
                value: `${
                  updatedRunner.count.ongoing * (updatedRunner.price || 0)
                }$`,
                inline: true,
              }
            ),
        ],
      });
    })
    .with("minus-one-runner", async () => {
      const messageId = interaction.message.id;
      const runner = (await store.getState()).runners.find(
        (runner) =>
          runner.countMessageId === messageId ||
          runner.infoMessageId === messageId
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
      const countChannel = await getChannel(config.COUNT_RUNNER_CHANNEL_ID);
      await countChannel.messages.cache
        .get(updatedRunner.countMessageId)
        ?.edit({
          embeds: [
            new MessageEmbed()
              .setTitle(updatedRunner.name)
              .setColor("GREEN")
              .setFields(
                {
                  name: "Téléphone",
                  value: updatedRunner.phoneNumber,
                  inline: true,
                },
                {
                  name: "Compteur",
                  value: `${updatedRunner.count.ongoing}`,
                  inline: true,
                }
              ),
          ],
        });
      const infoChannel = await getChannel(config.INFO_RUNNER_CHANNEL_ID);
      await (
        await infoChannel.messages.fetch(updatedRunner.infoMessageId)
      )?.edit({
        embeds: [
          new MessageEmbed()
            .setTitle(updatedRunner.name)
            .setColor("GREEN")
            .setFields(
              {
                name: "Téléphone",
                value: updatedRunner.phoneNumber,
                inline: true,
              },
              { name: "Prix", value: `${updatedRunner.price}$`, inline: true },
              {
                name: "Livraison",
                value: `${updatedRunner.rdvPlace}`,
                inline: true,
              },
              {
                name: "Compteur",
                value: `${updatedRunner.count.ongoing}`,
                inline: true,
              },
              {
                name: "Total",
                value: `${updatedRunner.count.total}`,
                inline: true,
              },
              {
                name: "A payer",
                value: `${
                  updatedRunner.count.ongoing * (updatedRunner.price || 0)
                }$`,
                inline: true,
              }
            ),
        ],
      });
    })
    .with("new-runner", async () => {
      const messageId = interaction.message.id;
      const runner = (await store.getState()).runners.find(
        (runner) =>
          runner.countMessageId === messageId ||
          runner.infoMessageId === messageId
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
      const countChannel = await getChannel(config.COUNT_RUNNER_CHANNEL_ID);
      await countChannel.messages.cache
        .get(updatedRunner.countMessageId)
        ?.edit({
          embeds: [
            new MessageEmbed()
              .setTitle(updatedRunner.name)
              .setColor("GREEN")
              .setFields(
                {
                  name: "Téléphone",
                  value: updatedRunner.phoneNumber,
                  inline: true,
                },
                {
                  name: "Compteur",
                  value: `${updatedRunner.count.ongoing}`,
                  inline: true,
                }
              ),
          ],
        });
      const infoChannel = await getChannel(config.INFO_RUNNER_CHANNEL_ID);
      await (
        await infoChannel.messages.fetch(updatedRunner.infoMessageId)
      )?.edit({
        embeds: [
          new MessageEmbed()
            .setTitle(updatedRunner.name)
            .setColor("GREEN")
            .setFields(
              {
                name: "Téléphone",
                value: updatedRunner.phoneNumber,
                inline: true,
              },
              { name: "Prix", value: `${updatedRunner.price}$`, inline: true },
              {
                name: "Livraison",
                value: `${updatedRunner.rdvPlace}`,
                inline: true,
              },
              {
                name: "Compteur",
                value: `${updatedRunner.count.ongoing}`,
                inline: true,
              },
              {
                name: "Total",
                value: `${updatedRunner.count.total}`,
                inline: true,
              },
              {
                name: "A payer",
                value: `${
                  updatedRunner.count.ongoing * (updatedRunner.price || 0)
                }$`,
                inline: true,
              }
            ),
        ],
      });
    })
    .with("delete-runner", async () => {
      const messageId = interaction.message.id;
      const runner = (await store.getState()).runners.find(
        (runner) =>
          runner.countMessageId === messageId ||
          runner.infoMessageId === messageId
      );
      if (!runner) {
        interaction.reply({ content: "Runner inconnu", ephemeral: true });
        return;
      }
      const countChannel = await getChannel(config.COUNT_RUNNER_CHANNEL_ID);
      await (
        await countChannel.messages.fetch(runner.countMessageId)
      )?.delete();
      const infoChannel = await getChannel(config.INFO_RUNNER_CHANNEL_ID);
      await (await infoChannel.messages.fetch(runner.infoMessageId))?.delete();
      await store.mutations.removeRunner(runner);
    })
    .otherwise((value) =>
      console.log("couldnt handle button with customId", value)
    );
};
