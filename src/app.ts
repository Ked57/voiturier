import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client, Collection, CommandInteraction, Intents } from "discord.js";
import { aCommand } from "./commands/a";
import { initConfig } from "./config";

export const config = initConfig();

const rest = new REST({ version: "9" }).setToken(config.TOKEN);

const commandList = [aCommand];
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const commands = new Collection<
  string,
  {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute: (interaction: CommandInteraction) => Promise<void>;
  }
>();

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});
(async () => {
  try {
    console.log("Started refreshing Voiturier (/) commands.");
    const jsonCommands: any[] = [];
    for await (const command of commandList) {
      commands.set(command.data.name, command);
      jsonCommands.push(command.data.toJSON());
    }
    await rest.put(
      Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
      {
        body: jsonCommands,
      }
    );
    console.log("Successfully reloaded Voiturier (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

client.login(config.TOKEN);
