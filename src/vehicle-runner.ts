import { MessageEmbed } from "discord.js";
import { config } from "./app";
import {
  createRunnerCarInitialMessageActionRow,
  createContactRemoveMessageActionRow,
} from "./button";
import { postMessageInChannel } from "./message";

export const postCarInVehicleRunner = async (model: string) => {
  const message = await postMessageInChannel(config.VEHICLE_RUNNER_CHANNEL_ID, {
    content: `${model}`,
    components: [createRunnerCarInitialMessageActionRow()],
  });
  return message.id;
};

export const postContactInVehicleRunner = async (description: string) => {
  const message = await postMessageInChannel(config.VEHICLE_RUNNER_CHANNEL_ID, {
    embeds: [
      new MessageEmbed()
        .setTitle(`Personne contact: ${description}`)
        .setColor("GREEN"),
    ],
    components: [createContactRemoveMessageActionRow()],
  });
  return message.id;
};
