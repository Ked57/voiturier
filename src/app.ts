import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client, Collection, Intents } from "discord.js";
import { handleButton } from "./button";
import { aCommand } from "./commands/a";
import { Command, handleCommand } from "./commands/command";
import { initConfig } from "./config";
import { initStore } from "./store";

export const config = initConfig();
export const store = initStore();

const rest = new REST({ version: "9" }).setToken(config.TOKEN);

const commandList = [aCommand];
export const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const commands = new Collection<string, Command>();

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    handleCommand(commands, interaction);
  } else if (interaction.isButton()) {
    handleButton(interaction);
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
