import { existsSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { z, ZodError } from "zod";
import { ConfigError } from "../helper/errors";
import { cardsConfigSchema, CardsConfig } from "../schemas/card";

const CONFIG_PATH = fileURLToPath(new URL("../../cards.config.json", import.meta.url));

// A pasted CARDS_CONFIG often carries terminal wrapping (a line break plus indentation), which is never part of the JSON.
const readRawConfig = (): unknown => {
  if (process.env.CARDS_CONFIG) return JSON.parse(process.env.CARDS_CONFIG.replace(/[\r\n]+[ \t]*/g, ""));
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
    const detail = error instanceof ZodError ? z.prettifyError(error) : error instanceof Error ? error.message : String(error);
    throw new ConfigError(`${source} is invalid:\n${detail}`);
  }
};

export const configuredRepos = (): string[] => [...new Set(getCardsConfig().projects.flatMap(project => project.repos))];
