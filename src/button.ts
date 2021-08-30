import {
  ButtonInteraction,
  GuildMember,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { match } from "ts-pattern";
import { client, store } from "./app";
import { createCarFoundEmbed, createCarInitialEmbed } from "./embed";
import { Car } from "./store";

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

export const handleButton = (interaction: ButtonInteraction) => {
  if (!interaction.isButton()) return;
  match(interaction.customId)
    .with("found", () => {
      const embed = interaction.message.embeds[0];
      if (!embed.title) {
        return;
      }
      store.mutations.updateCarState({
        messageId: interaction.message.id,
        model: embed.title,
        state: "FOUND",
      });
      interaction.update({
        components: [createCarFoundMessageActionRow()],
        embeds: [
          createCarFoundEmbed(
            embed.title,
            embed.fields?.at(0)?.value || "",
            (interaction.member as GuildMember).displayName || ""
          ),
        ],
      });
    })
    .with("lost", () => {
      const embed = interaction.message.embeds[0];
      if (!embed.title) {
        return;
      }
      store.mutations.updateCarState({
        messageId: interaction.message.id,
        model: embed.title,
        state: "IDLE",
      });
      interaction.update({
        components: [createCarInitialMessageActionRow()],
        embeds: [
          createCarInitialEmbed(
            embed.title,
            (interaction.member as GuildMember)?.displayName || ""
          ),
        ],
      });
    })
    .with("sell", async () => {
      const embed = interaction.message.embeds[0];
      if (!embed.title) {
        return;
      }
      try {
        const channel = (await client.channels.fetch(
          interaction.channelId || ""
        )) as any;
        const message = await channel?.messages.fetch(interaction.message.id);
        if (!message) {
          return;
        }
        await message.delete();
        const car: Car = {
          messageId: interaction.message.id,
          model: embed.title,
          state: "IDLE",
        };
        store.mutations.sellCar(car);
        store.mutations.removeCar(car);
      } catch (err) {
        console.error(err);
      }
    })
    .with("delete", async () => {
      const embed = interaction.message.embeds[0];
      if (!embed.title) {
        return;
      }
      try {
        const channel = (await client.channels.fetch(
          interaction.channelId || ""
        )) as any;
        const message = await channel?.messages.fetch(interaction.message.id);
        if (!message) {
          return;
        }
        await message.delete();
        store.mutations.removeCar({
          messageId: interaction.message.id,
          model: embed.title,
          state: "IDLE",
        });
      } catch (err) {
        console.error(err);
      }
    })
    .otherwise((value) =>
      console.log("couldnt handle button with customId", value)
    );
};
