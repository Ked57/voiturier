import { SlashCommandBuilder } from "@discordjs/builders";
import { Collection, CommandInteraction, GuildMember } from "discord.js";
import { userHasRoles } from "../user";

export type Command = {
  data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: CommandInteraction) => Promise<void>;
};

export const handleCommand = async (
  commands: Collection<string, Command>,
  interaction: CommandInteraction
) => {
  if (!interaction.isCommand()) return;

  if (
    !userHasRoles(interaction.member as GuildMember, [
      "Jamestown",
      "Chef Runner",
    ])
  ) {
    interaction.reply({
      content: "Vous n'êtes pas autorisé a éxécuter cette commande",
      ephemeral: true,
    });
    return;
  }

  const command = commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    }).catch(err => console.error(err));
  }
};
