import { existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { cardsConfigSchema, CardsConfig } from "../schemas/card";

const CONFIG_PATH = fileURLToPath(new URL("../../cards.config.json", import.meta.url));

// CARDS_CONFIG wins so a host can carry the config without the gitignored file being deployed.
const readRawConfig = (): unknown => {
  if (process.env.CARDS_CONFIG) return JSON.parse(process.env.CARDS_CONFIG);
  if (existsSync(CONFIG_PATH)) return JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  return {};
};

let config: CardsConfig | undefined;

export const getCardsConfig = (): CardsConfig => {
  config ??= cardsConfigSchema.parse(readRawConfig());
  return config;
};

export const configuredRepos = (): string[] => [...new Set(getCardsConfig().projects.flatMap(project => project.repos))];
