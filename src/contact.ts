import { ButtonInteraction, GuildMember } from "discord.js";
import { config, store } from "./app";
import { deleteMessageInChannel } from "./message";

export const removeContact = async (interaction: ButtonInteraction) => {
  const state = await store.getState();
  if (!state.contact) {
    console.error("ERROR: Trying to remove contact -> contact not found");
    return;
  }
  try {
    await deleteMessageInChannel(
      config.VEHICLE_CHANNEL_ID,
      state.contact.vehicleMessageId
    );
    await deleteMessageInChannel(
      config.VEHICLE_RUNNER_CHANNEL_ID,
      state.contact.vehicleRunnerMessageId
    );
    await store.mutations.setContact();
    console.log(
      `${(interaction.member as GuildMember).displayName} removed contact`
    );
  } catch (err) {
    console.error(err);
  }
};
