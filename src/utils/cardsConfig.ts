import { existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { ConfigError } from "../helper/errors";
import { cardsConfigSchema, CardsConfig } from "../schemas/card";

const CONFIG_PATH = fileURLToPath(new URL("../../cards.config.json", import.meta.url));

// CARDS_CONFIG wins so a host can carry the config without the gitignored file being deployed.
// Line breaks are stripped because a pasted dashboard value often picks up wrapping; no repo or project name contains one.
const readRawConfig = (): unknown => {
  if (process.env.CARDS_CONFIG) return JSON.parse(process.env.CARDS_CONFIG.replace(/[\r\n\t]/g, ""));
  if (existsSync(CONFIG_PATH)) return JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
  return {};
};

let config: CardsConfig | undefined;

export const getCardsConfig = (): CardsConfig => {
  if (config) return config;

  try {
    config = cardsConfigSchema.parse(readRawConfig());
    return config;
  } catch (error) {
    const source = process.env.CARDS_CONFIG ? "CARDS_CONFIG" : "cards.config.json";
    throw new ConfigError(`${source} is invalid: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const configuredRepos = (): string[] => [...new Set(getCardsConfig().projects.flatMap(project => project.repos))];
