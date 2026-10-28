import { LanguageShare } from "../../interface";
import { escapeXml, frame, header } from "./svg";
import { Palette } from "./theme";

const WIDTH = 400;
const [BAR_LEFT, BAR_WIDTH, BAR_Y, GAP] = [24, 352, 68, 2];

const colourFor = (language: LanguageShare, palette: Palette) =>
  language.name === "Other" ? palette.other : (palette.languages[language.name] ?? language.color ?? palette.other);

export const renderLanguages = (languages: LanguageShare[], palette: Palette) => {
  const usable = BAR_WIDTH - GAP * Math.max(0, languages.length - 1);

  let x = BAR_LEFT;
  const segments = languages
    .map(language => {
      const width = (language.percent / 100) * usable;
      const segment = `<rect x="${x.toFixed(1)}" y="${BAR_Y}" width="${width.toFixed(1)}" height="12" fill="${colourFor(language, palette)}"/>`;
      x += width + GAP;
      return segment;
    })
    .join("");

  const rows = languages
    .map((language, index) => {
      const y = 118 + index * 28;
      return (
        `<rect x="24" y="${y - 9}" width="10" height="10" rx="2" fill="${colourFor(language, palette)}"/>` +
        `<text x="44" y="${y}" class="name">${escapeXml(language.name)}</text>` +
        `<text x="376" y="${y}" class="num" text-anchor="end">${language.percent.toFixed(1)}%</text>`
      );
    })
    .join("");

  return frame({
    palette,
    width: WIDTH,
    height: 300,
    label: "Most used languages",
    body: `
${header(WIDTH, "MOST USED LANGUAGES", "BY BYTES")}
<defs><clipPath id="language-bar"><rect x="${BAR_LEFT}" y="${BAR_Y}" width="${BAR_WIDTH}" height="12" rx="4"/></clipPath></defs>
<g clip-path="url(#language-bar)">${segments}</g>
${rows}
`,
  });
};
