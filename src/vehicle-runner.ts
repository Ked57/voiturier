import { config } from "./app";
import { createRunnerCarInitialMessageActionRow } from "./button";
import { postMessageInChannel } from "./message";

export const postInVehicleRunner = async (model: string) => {
  const message = await postMessageInChannel(config.VEHICLE_RUNNER_CHANNEL_ID, {
    content: `${model}`,
    components: [createRunnerCarInitialMessageActionRow()],
  });
  return message.id;
};
