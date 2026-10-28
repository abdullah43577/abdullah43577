import { ThemeName } from "../../schemas/card";

export interface Palette {
  surface: string;
  border: string;
  grid: string;
  fg: string;
  muted: string;
  subtle: string;
  data: string;
  accent: string;
  other: string;
  languages: Record<string, string>;
}

// Language steps are GitHub's own hues, re-stepped until they passed the palette validator on each theme's surface.
export const palettes: Record<ThemeName, Palette> = {
  light: {
    surface: "#FFFFFF",
    border: "#E5E2DB",
    grid: "#EFECE6",
    fg: "#14141A",
    muted: "#5F5D58",
    subtle: "#8C8A84",
    data: "#8C8A84",
    accent: "#B5451F",
    other: "#B9B5AC",
    languages: { TypeScript: "#3178C6", JavaScript: "#A88B00", Python: "#008FA3", CSS: "#7E3FBF", HTML: "#E34C26" },
  },
  dark: {
    surface: "#0D1117",
    border: "#30363D",
    grid: "#21262D",
    fg: "#F5F4F2",
    muted: "#9C9A95",
    subtle: "#7D7B76",
    data: "#6B6A67",
    accent: "#F0703F",
    other: "#4A4946",
    languages: { TypeScript: "#3D85D8", JavaScript: "#A08A1E", Python: "#1598A8", CSS: "#9F55D6", HTML: "#D9582F" },
  },
};
