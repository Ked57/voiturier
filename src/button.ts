import {
  ButtonInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { match } from "ts-pattern";
import { client, store } from "./app";
import { Car } from "./store";

export const createInitialCarMessageActionRow = () =>
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

export const createFoundCarMessageActionRow = () =>
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
        components: [createFoundCarMessageActionRow()],
        embeds: [
          new MessageEmbed()
            .setColor("#26773F")
            .setTitle(embed.title)
            .setFields([
              {
                name: "Marqué par",
                value: interaction.user.username,
                inline: true,
              },
            ]),
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
        components: [createInitialCarMessageActionRow()],
        embeds: [new MessageEmbed().setColor("#0099ff").setTitle(embed.title)],
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
