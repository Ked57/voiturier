import {
  ButtonInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { match } from "ts-pattern";
import { config, store } from "./app";
import { getChannel } from "./channel";
import {
  createCarFoundEmbed,
  createCarInitialEmbed,
  createRunnerCarFoundEmbed,
  createRunnerCarInitialEmbed,
} from "./embed";

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

export const handleButton = (interaction: ButtonInteraction) => {
  if (!interaction.isButton()) return;
  match(interaction.customId)
    .with("found", () => {
      const car = store.state.cars.find(
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
      const embed = interaction.message.embeds[0];
      if (!embed.title) {
        return;
      }
      store.mutations.updateCarState(interaction.message.id, "FOUND");
      const vehicleMessage = getChannel(
        config.VEHICLE_CHANNEL_ID
      )?.messages.cache.find((message) => message.id === car.messageId);
      const vehicleRunnerMessage = getChannel(
        config.VEHICLE_RUNNER_CHANNEL_ID
      )?.messages.cache.find((message) => message.id === car.runnerMessageId);
      vehicleMessage?.edit({
        components: [createCarFoundMessageActionRow()],
        embeds: [
          createCarFoundEmbed(
            embed.title,
            vehicleMessage.embeds[0]?.fields?.at(0)?.value || "",
            (interaction.member as GuildMember).displayName || ""
          ),
        ],
      });
      vehicleRunnerMessage?.edit({
        components: [createRunnerCarFoundMessageActionRow()],
        embeds: [
          createRunnerCarFoundEmbed(
            embed.title,
            (interaction.member as GuildMember).displayName || ""
          ),
        ],
      });
    })
    .with("lost", () => {
      const car = store.state.cars.find(
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
      const embed = interaction.message.embeds[0];
      if (!embed.title) {
        return;
      }
      store.mutations.updateCarState(interaction.message.id, "IDLE");
      const vehicleMessage = getChannel(
        config.VEHICLE_CHANNEL_ID
      )?.messages.cache.find((message) => message.id === car.messageId);
      const vehicleRunnerMessage = getChannel(
        config.VEHICLE_RUNNER_CHANNEL_ID
      )?.messages.cache.find((message) => message.id === car.runnerMessageId);
      vehicleMessage?.edit({
        components: [createCarInitialMessageActionRow()],
        embeds: [
          createCarInitialEmbed(
            embed.title,
            vehicleMessage.embeds[0]?.fields?.at(0)?.value || ""
          ),
        ],
      });
      vehicleRunnerMessage?.edit({
        components: [createRunnerCarInitialMessageActionRow()],
        embeds: [createRunnerCarInitialEmbed(embed.title)],
      });
    })
    .with("sell", async () => {
      const car = store.state.cars.find(
        (car) => car.messageId === interaction.message.id
      );
      if (!car) {
        console.error(
          "ERROR: Clicking 'sell' button -> Couldn't find car with messageId",
          interaction.message.id
        );
        return;
      }
      const embed = interaction.message.embeds[0];
      if (!embed.title) {
        return;
      }
      try {
        (
          await getChannel(config.VEHICLE_CHANNEL_ID)?.messages.fetch(
            car.messageId
          )
        )?.delete();
        (
          await getChannel(config.VEHICLE_RUNNER_CHANNEL_ID)?.messages.fetch(
            car.runnerMessageId
          )
        )?.delete();

        store.mutations.sellCar(car.messageId);
        store.mutations.removeCar(car.messageId);
      } catch (err) {
        console.error(err);
      }
    })
    .with("delete", async () => {
      const car = store.state.cars.find(
        (car) => car.messageId === interaction.message.id
      );
      if (!car) {
        console.error(
          "ERROR: Clicking 'delete' button -> Couldn't find car with messageId",
          interaction.message.id
        );
        return;
      }
      const embed = interaction.message.embeds[0];
      if (!embed.title) {
        return;
      }
      try {
        (
          await getChannel(config.VEHICLE_CHANNEL_ID)?.messages.fetch(
            car.messageId
          )
        )?.delete();
        (
          await getChannel(config.VEHICLE_RUNNER_CHANNEL_ID)?.messages.fetch(
            car.runnerMessageId
          )
        )?.delete();
        store.mutations.removeCar(car.messageId);
      } catch (err) {
        console.error(err);
      }
    })
    .otherwise((value) =>
      console.log("couldnt handle button with customId", value)
    );
};
