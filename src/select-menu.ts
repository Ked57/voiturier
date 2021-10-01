import {
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
} from "discord.js";
import { match } from "ts-pattern";
import { config, store } from "./app";
import { getChannel } from "./channel";

export const createSelectPriceSelectMenu = (name: string) =>
  new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId(`runner_price`)
      .setPlaceholder("Prix")
      .addOptions(
        {
          label: `0$`,
          value: `${name}/0`,
        },
        ...store.state.prices.map((price) => ({
          label: `${price}$`,
          value: `${name}/${price}`,
        }))
      )
  );
export const createSelectPlaceSelectMenu = (name: string) =>
  new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId(`runner_place`)
      .setPlaceholder("Livraison")
      .addOptions(
        {
          label: `Non définit`,
          value: `${name}/`,
        },
        ...store.state.rdvPlaces.map((place) => ({
          label: `${place}`,
          value: `${name}/${place}`,
        }))
      )
  );

export const handleSelectMenu = async (interaction: SelectMenuInteraction) => {
  if (!interaction.isSelectMenu()) return;
  match(interaction.customId)
    .with("runner_price", async () => {
      const value = interaction.values.at(-1);
      if (!value) {
        console.error(
          "Couldnt handle select with customId 'runner_price', no value selected"
        );
        return;
      }
      const [name, selectedValue] = value.split("/");
      const runner = store.state.runners.find((r) => r.name === name);
      if (!runner) {
        console.error(
          "Couldnt handle select with customId 'runner_price', runner not found"
        );
        return;
      }
      const updatedRunner = store.mutations.upsertRunner({
        ...runner,
        price: Number(selectedValue),
      });
      (await getChannel(config.INFO_RUNNER_CHANNEL_ID)).messages.cache
        .get(updatedRunner.infoMessageId)
        ?.edit({
          embeds: [
            new MessageEmbed()
              .setTitle(String(name))
              .setColor("GREEN")
              .setFields(
                {
                  name: "Téléphone",
                  value: updatedRunner.phoneNumber,
                  inline: true,
                },
                {
                  name: "Prix",
                  value: `${updatedRunner.price}$`,
                  inline: true,
                },
                {
                  name: "Livraison",
                  value: `${updatedRunner.rdvPlace}`,
                  inline: true,
                },
                {
                  name: "Compteur",
                  value: `${updatedRunner.count.ongoing}`,
                  inline: true,
                },
                {
                  name: "Total",
                  value: `${updatedRunner.count.total}`,
                  inline: true,
                },
                {
                  name: "A payer",
                  value: `${
                    updatedRunner.count.ongoing * (updatedRunner.price || 0)
                  }$`,
                  inline: true,
                }
              ),
          ],
        });
    })
    .with("runner_place", async () => {
      const value = interaction.values.at(-1);
      if (!value) {
        console.error(
          "Couldnt handle select with customId 'runner_place', no value selected"
        );
        return;
      }
      const [name, selectedValue] = value.split("/");
      const runner = store.state.runners.find((r) => r.name === name);
      if (!runner) {
        console.error(
          "Couldnt handle select with customId 'runner_place', runner not found"
        );
        return;
      }
      const updatedRunner = store.mutations.upsertRunner({
        ...runner,
        rdvPlace: String(selectedValue),
      });
      (await getChannel(config.INFO_RUNNER_CHANNEL_ID)).messages.cache
        .get(updatedRunner.infoMessageId)
        ?.edit({
          embeds: [
            new MessageEmbed()
              .setTitle(String(name))
              .setColor("GREEN")
              .setFields(
                {
                  name: "Téléphone",
                  value: updatedRunner.phoneNumber,
                  inline: true,
                },
                {
                  name: "Prix",
                  value: `${updatedRunner.price}$`,
                  inline: true,
                },
                {
                  name: "Livraison",
                  value: `${updatedRunner.rdvPlace}`,
                  inline: true,
                },
                {
                  name: "Compteur",
                  value: `${updatedRunner.count.ongoing}`,
                  inline: true,
                },
                {
                  name: "Total",
                  value: `${updatedRunner.count.total}`,
                  inline: true,
                },
                {
                  name: "A payer",
                  value: `${
                    updatedRunner.count.ongoing * (updatedRunner.price || 0)
                  }$`,
                  inline: true,
                }
              ),
          ],
        });
    })
    .otherwise((value) =>
      console.error("Couldnt handle select with customId", value)
    );
};
