import { MessageEmbed } from "discord.js";

export const createCarInitialEmbed = (model: string, userName: string) =>
  new MessageEmbed()
    .setColor("#0099ff")
    .setTitle(model)
    .addField("Pour", userName);

export const createRunnerCarInitialEmbed = (model: string) =>
  new MessageEmbed().setColor("#0099ff").setTitle(model);

export const createCarFoundEmbed = (
  model: string,
  ownerName: string,
  foundByName: string
) =>
  new MessageEmbed()
    .setColor("#26773F")
    .setTitle(model)
    .setFields([
      {
        name: "Pour",
        value: ownerName,
        inline: true,
      },
      {
        name: "Marqué par",
        value: foundByName,
        inline: true,
      },
    ]);

export const createRunnerCarFoundEmbed = (model: string, foundByName: string) =>
  new MessageEmbed()
    .setColor("#26773F")
    .setTitle(model)
    .setFields([
      {
        name: "Marqué par",
        value: foundByName,
        inline: true,
      },
    ]);
