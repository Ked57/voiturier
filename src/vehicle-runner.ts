import { config } from "./app";
import { createRunnerCarInitialMessageActionRow } from "./button";
import { createRunnerCarInitialEmbed } from "./embed";
import { postMessageInChannel } from "./message";

export const postInVehicleRunner = async (model: string) => {
  const message = await postMessageInChannel(config.VEHICLE_RUNNER_CHANNEL_ID, {
    embeds: [createRunnerCarInitialEmbed(model)],
    components: [createRunnerCarInitialMessageActionRow()],
  });
  return message.id;
};
