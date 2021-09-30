const configList = [
  "CLIENT_ID",
  "GUILD_ID",
  "TOKEN",
  "PERMISSIONS",
  "VEHICLE_CHANNEL_ID",
  "VEHICLE_RUNNER_CHANNEL_ID",
  "GLOBAL_COUNT_CHANNEL_ID",
  "DB_CHANNEL_ID",
  "DB_MESSAGE_ID",
];

type Config = {
  CLIENT_ID: string;
  GUILD_ID: string;
  TOKEN: string;
  PERMISSIONS: string;
  VEHICLE_CHANNEL_ID: string;
  VEHICLE_RUNNER_CHANNEL_ID: string;
  GLOBAL_COUNT_CHANNEL_ID: string;
  DB_CHANNEL_ID: string;
  DB_MESSAGE_ID: string;
};

const isConfig = (config: Partial<Config>): config is Config =>
  Object.entries(config).every(([_, value]) => {
    if (!value || value === "") {
      return false;
    }
    return true;
  });

export const initConfig = () => {
  const config = configList.reduce<Partial<Config>>(
    (prev, curr) => ({ ...prev, [curr]: process.env[curr] || "" }),
    {}
  );
  if (!isConfig(config)) {
    throw new Error(
      "Voiturier couldn't start because one or more env variables aren't set, check config.ts for mandary env variables"
    );
  }
  return config;
};
