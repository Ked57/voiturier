import {
  ButtonInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { match } from "ts-pattern";
import { config, store } from "./app";
import { getChannel } from "./channel";

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

export const handleButton = (interaction: ButtonInteraction) => {
  if (!interaction.isButton()) return;
  match(interaction.customId)
    .with("found", () => {
      const foundBy = (interaction.member as GuildMember).displayName;
      if (!foundBy) {
        console.error(
          "ERROR: Clicking 'found' button -> Unknown display user",
          interaction.message.id
        );
        return;
      }
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
      store.mutations.updateCarState(interaction.message.id, "FOUND", foundBy);
      const vehicleMessage = getChannel(
        config.VEHICLE_CHANNEL_ID
      )?.messages.cache.find((message) => message.id === car.messageId);
      const vehicleRunnerMessage = getChannel(
        config.VEHICLE_RUNNER_CHANNEL_ID
      )?.messages.cache.find((message) => message.id === car.runnerMessageId);
      vehicleMessage?.edit({
        components: [createCarFoundMessageActionRow()],
        content: `${car.model} - ${car.for} - **${foundBy}** ✅`,
      });
      vehicleRunnerMessage?.edit({
        components: [createRunnerCarFoundMessageActionRow()],
        content: `${car.model} ✅`,
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
      store.mutations.updateCarState(interaction.message.id, "IDLE");
      const vehicleMessage = getChannel(
        config.VEHICLE_CHANNEL_ID
      )?.messages.cache.find((message) => message.id === car.messageId);
      const vehicleRunnerMessage = getChannel(
        config.VEHICLE_RUNNER_CHANNEL_ID
      )?.messages.cache.find((message) => message.id === car.runnerMessageId);
      vehicleMessage?.edit({
        components: [createCarInitialMessageActionRow()],
        content: `${car.model} - ${car.for}`,
      });
      vehicleRunnerMessage?.edit({
        components: [createRunnerCarInitialMessageActionRow()],
        content: `${car.model}`,
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
    .with("delete-contact", async () => {
      if (!store.state.contact) {
        console.error("ERROR: Trying to remove contact -> contact not found");
        return;
      }
      try {
        (
          await getChannel(config.VEHICLE_CHANNEL_ID)?.messages.fetch(
            store.state.contact.vehicleMessageId
          )
        )?.delete();
        (
          await getChannel(config.VEHICLE_RUNNER_CHANNEL_ID)?.messages.fetch(
            store.state.contact.vehicleRunnerMessageId
          )
        )?.delete();
        store.mutations.setContact();
      } catch (err) {
        console.error(err);
      }
    })
    .otherwise((value) =>
      console.log("couldnt handle button with customId", value)
    );
};
