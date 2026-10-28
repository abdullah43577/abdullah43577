import { LanguageShare, LanguageSize } from "../interface";

const TOP_COUNT = 5;

export const toLanguageShares = (sizes: LanguageSize[], exclude: string[]): LanguageShare[] => {
  const excluded = new Set(exclude.map(name => name.toLowerCase()));
  const kept = sizes.filter(language => !excluded.has(language.name.toLowerCase()) && language.size > 0).sort((a, b) => b.size - a.size);

  const total = kept.reduce((sum, language) => sum + language.size, 0);
  if (!total) return [];

  const top = kept.slice(0, TOP_COUNT).map(language => ({
    name: language.name,
    percent: (language.size / total) * 100,
    color: language.color,
  }));

  const rest = kept.slice(TOP_COUNT).reduce((sum, language) => sum + language.size, 0);
  return rest ? [...top, { name: "Other", percent: (rest / total) * 100, color: null }] : top;
};
