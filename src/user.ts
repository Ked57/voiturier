import { GuildMember } from "discord.js";
import { client, config } from "./app";

export const userHasRoles = (user: GuildMember, roles: string[]) => {
  const foundRoles = client.guilds.cache
    .find((value) => value.id === config.GUILD_ID)
    ?.roles.cache.filter(
      (value) => typeof roles.find((v) => v === value.name) === "string"
    );
  if (!foundRoles) {
    return false;
  }
  return user.roles.cache.hasAny(...foundRoles.map((role) => role.id));
};
