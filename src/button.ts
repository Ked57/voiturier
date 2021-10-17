import { ButtonInteraction, MessageActionRow, MessageButton } from "discord.js";
import { match } from "ts-pattern";
import {
  decrementRunnerCount,
  incrementRunnerCount,
  resetRunnerCount,
} from "./channels/runner-count";
import { deleteRunner } from "./channels/runner-info";
import {
  unmarkVehicle,
  removeVehicle,
  sellVehicle,
  markVehicle,
} from "./channels/vehicle";
import { removeContact } from "./contact";

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

export const createRunnerCarInitialMessageActionRow = () =>
  new MessageActionRow().addComponents([
    new MessageButton()
      .setCustomId("found")
      .setLabel("Marquer ✅")
      .setStyle("SUCCESS"),
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

export const createRunnerCarFoundMessageActionRow = () =>
  new MessageActionRow().addComponents([
    new MessageButton()
      .setCustomId("lost")
      .setLabel("Démarquer 🤬")
      .setStyle("PRIMARY"),
  ]);

export const createContactRemoveMessageActionRow = () =>
  new MessageActionRow().addComponents([
    new MessageButton()
      .setCustomId("delete-contact")
      .setLabel("Supprimer ❌")
      .setStyle("DANGER"),
  ]);

export const createCountRunnerMessageActionRow = () =>
  new MessageActionRow().addComponents([
    new MessageButton()
      .setCustomId("plus-one-runner")
      .setLabel("+1 ➕")
      .setStyle("PRIMARY"),
    new MessageButton()
      .setCustomId("minus-one-runner")
      .setLabel("-1 ➖")
      .setStyle("PRIMARY"),
    new MessageButton()
      .setCustomId("new-runner")
      .setLabel("New 🆕")
      .setStyle("PRIMARY"),
  ]);
export const createInfoRunnerMessageActionRow = () =>
  new MessageActionRow().addComponents([
    new MessageButton()
      .setCustomId("delete-runner")
      .setLabel("Supprimer ❌")
      .setStyle("DANGER"),
  ]);

export const handleButton = async (interaction: ButtonInteraction) => {
  if (!interaction.isButton()) return;
  match(interaction.customId)
    .with("found", () => markVehicle(interaction))
    .with("lost", () => unmarkVehicle(interaction))
    .with("sell", () => sellVehicle(interaction))
    .with("delete", () => removeVehicle(interaction))
    .with("delete-contact", () => removeContact(interaction))
    .with("plus-one-runner", () => incrementRunnerCount(interaction))
    .with("minus-one-runner", () => decrementRunnerCount(interaction))
    .with("new-runner", () => resetRunnerCount(interaction))
    .with("delete-runner", () => deleteRunner(interaction))
    .otherwise((value) =>
      console.log("couldnt handle button with customId", value)
    );
};
