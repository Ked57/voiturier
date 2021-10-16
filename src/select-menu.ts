import {
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
  SelectMenuInteraction,
} from "discord.js";
import { match } from "ts-pattern";
import { config, store } from "./app";
import { createInfoRunnerMessageActionRow } from "./button";
import { getChannel } from "./channel";

export const createSelectPriceSelectMenu = async (
  name: string,
  prices: number[]
) =>
  new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId(`runner_price`)
      .setPlaceholder("Prix")
      .addOptions(
        {
          label: `0$`,
          value: `${name}/0`,
        },
        ...prices.map((price) => ({
          label: `${price}$`,
          value: `${name}/${price}`,
        }))
      )
  );
export const createSelectPlaceSelectMenu = async (
  name: string,
  rdvPlaces: string[]
) =>
  new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId(`runner_place`)
      .setPlaceholder("Livraison")
      .addOptions(
        {
          label: `Non définit`,
          value: `${name}/`,
        },
        ...rdvPlaces.map((place) => ({
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
      const state = await store.getState();
      const [name, selectedValue] = value.split("/");
      const runner = state.runners.find((r) => r.name === name);
      if (!runner) {
        console.error(
          "Couldnt handle select with customId 'runner_price', runner not found"
        );
        return;
      }
      const updatedRunner = await store.mutations.upsertRunner({
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
          components: [
            await createSelectPriceSelectMenu(runner.name, state.prices),
            await createSelectPlaceSelectMenu(runner.name, state.rdvPlaces),
            createInfoRunnerMessageActionRow(),
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
      const state = await store.getState();
      const runner = state.runners.find((r) => r.name === name);
      if (!runner) {
        console.error(
          "Couldnt handle select with customId 'runner_place', runner not found"
        );
        return;
      }
      const updatedRunner = await store.mutations.upsertRunner({
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
          components: [
            await createSelectPriceSelectMenu(runner.name, state.prices),
            await createSelectPlaceSelectMenu(runner.name, state.rdvPlaces),
            createInfoRunnerMessageActionRow(),
          ],
        });
    })
    .otherwise((value) =>
      console.error("Couldnt handle select with customId", value)
    );
};
