const configList = [
  "HASURA_ADMIN_SECRET",
  "CLIENT_ID",
  "GUILD_ID",
  "TOKEN",
  "PERMISSIONS",
];

type Config = {
  HASURA_ADMIN_SECRET: string;
  CLIENT_ID: string;
  GUILD_ID: string;
  TOKEN: string;
  PERMISSIONS: string;
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
