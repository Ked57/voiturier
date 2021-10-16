import { ButtonInteraction, GuildMember } from "discord.js";
import { config, store } from "../app";
import {
  createCarFoundMessageActionRow,
  createCarInitialMessageActionRow,
  createRunnerCarFoundMessageActionRow,
  createRunnerCarInitialMessageActionRow,
} from "../button";
import { getChannel } from "../channel";
import { updateDailyGlobalCount } from "../global-count";
import { deleteMessageInChannel } from "../message";

export const removeVehicle = async (interaction: ButtonInteraction) => {
  const state = await store.getState();
  const car = state.cars.find(
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
    await deleteMessageInChannel(config.VEHICLE_CHANNEL_ID, car.messageId);
    await deleteMessageInChannel(
      config.VEHICLE_RUNNER_CHANNEL_ID,
      car.runnerMessageId
    );
    await store.mutations.removeCar(car.messageId);
    console.log(
      `${(interaction.member as GuildMember).displayName} removed vehicle ${
        car.model
      } from ${car.for}`
    );
  } catch (err) {
    console.error(err);
  }
};

export const sellVehicle = async (interaction: ButtonInteraction) => {
  const state = await store.getState();
  const car = state.cars.find(
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
    await deleteMessageInChannel(config.VEHICLE_CHANNEL_ID, car.messageId);
    await deleteMessageInChannel(
      config.VEHICLE_RUNNER_CHANNEL_ID,
      car.runnerMessageId
    );

    await store.mutations.sellCar(car.messageId);
    await store.mutations.removeCar(car.messageId);
    await updateDailyGlobalCount(state.dailyCount?.count || 1);
    console.log(
      `${(interaction.member as GuildMember).displayName} sold vehicle ${
        car.model
      } from ${car.for}`
    );
  } catch (err) {
    console.error(err);
  }
};

export const unmarkVehicle = async (interaction: ButtonInteraction) => {
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
    console.log(
      `${(interaction.member as GuildMember).displayName} unmarked vehicle ${
        car.model
      } from ${car.for}`
    );
  } catch (err) {
    console.error("ERROR: Trying to interact with lost button", err);
  }
};

export const markVehicle = async (interaction: ButtonInteraction) => {
  const foundBy = (interaction.member as GuildMember).displayName;
  const state = await store.getState();
  if (!foundBy) {
    console.error(
      "ERROR: Clicking 'found' button -> Unknown display user",
      interaction.message.id
    );
    return;
  }
  const car = state.cars.find(
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
    console.log(
      `${(interaction.member as GuildMember).displayName} marked vehicle ${
        car.model
      } from ${car.for}`
    );
  } catch (err) {
    console.error("ERROR: Trying to interact with found button", err);
  }
};
