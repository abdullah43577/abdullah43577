import { Palette } from "./theme";

const SANS = `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace`;

export const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export const formatNumber = (value: number) => value.toLocaleString("en-US");

export const plural = (count: number, word: string) => (count === 1 ? word : `${word}s`);

// System fonts render the cards, so text cannot be measured; these ratios hold for the stacks above.
export const estimateWidth = (text: string, size: number) =>
  [...text].reduce((width, char) => width + size * (/[0-9]/.test(char) ? 0.6 : /[,.]/.test(char) ? 0.3 : 0.58), 0);

const style = (palette: Palette) => `<style>
  .eyebrow { font: 500 11px ${MONO}; letter-spacing: 1.5px; fill: ${palette.subtle}; }
  .label { font: 500 10.5px ${MONO}; letter-spacing: 1.3px; fill: ${palette.subtle}; }
  .tick { font: 500 10.5px ${MONO}; fill: ${palette.subtle}; font-variant-numeric: tabular-nums; }
  .num { font: 500 12px ${MONO}; fill: ${palette.muted}; font-variant-numeric: tabular-nums; }
  .name { font: 500 13px ${SANS}; fill: ${palette.fg}; }
  .value { font: 600 28px ${SANS}; letter-spacing: -0.6px; fill: ${palette.fg}; }
  .hero { font: 600 56px ${SANS}; letter-spacing: -2px; fill: ${palette.fg}; }
  .unit { font: 500 15px ${SANS}; fill: ${palette.muted}; }
  .body { font: 400 13px ${SANS}; fill: ${palette.muted}; }
  .rule { stroke: ${palette.border}; stroke-width: 1; fill: none; }
  .grid { stroke: ${palette.grid}; stroke-width: 1; }
</style>`;

interface FrameOptions {
  palette: Palette;
  width: number;
  height: number;
  label: string;
  body: string;
}

export const frame = ({ palette, width, height, label, body }: FrameOptions) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}">
<title>${escapeXml(label)}</title>
${style(palette)}
<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" class="rule"/>
${body}
</svg>
`;

export const header = (width: number, left: string, right?: string) =>
  `<text x="24" y="34" class="eyebrow">${escapeXml(left)}</text>` +
  (right ? `<text x="${width - 24}" y="34" class="eyebrow" text-anchor="end">${escapeXml(right)}</text>` : "") +
  `<line x1="24" y1="50" x2="${width - 24}" y2="50" class="rule"/>`;

export const column = (x: number, baseline: number, width: number, height: number, radius: number, fill: string) => {
  if (height <= 0) return "";
  const r = Math.min(radius, height, width / 2);
  const top = baseline - height;
  return `<path d="M${x} ${baseline}V${top + r}Q${x} ${top} ${x + r} ${top}H${x + width - r}Q${x + width} ${top} ${x + width} ${top + r}V${baseline}Z" fill="${fill}"/>`;
};

export const bar = (x: number, y: number, width: number, height: number, radius: number, fill: string) => {
  const r = Math.min(radius, width, height / 2);
  const end = x + width;
  return `<path d="M${x} ${y}H${end - r}Q${end} ${y} ${end} ${y + r}V${y + height - r}Q${end} ${y + height} ${end - r} ${y + height}H${x}Z" fill="${fill}"/>`;
};
