import { MonthlyCommits } from "../../interface";
import { monthLabel, monthYearLabel } from "../dates";
import { column, frame, header } from "./svg";
import { Palette } from "./theme";

const WIDTH = 816;
const [PLOT_LEFT, PLOT_RIGHT, PLOT_TOP, BASELINE] = [64, 792, 72, 212];
const TICK_COUNT = 4;

const niceStep = (max: number) => {
  const raw = Math.max(1, max) / TICK_COUNT;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].find(multiple => multiple * magnitude >= raw) ?? 10;
  return step * magnitude;
};

export const renderMonthly = (months: MonthlyCommits[], palette: Palette) => {
  const values = months.map(month => month.commits);
  const peak = Math.max(...values);
  const step = niceStep(peak);
  const scaleMax = step * TICK_COUNT;
  const scale = (value: number) => (value / scaleMax) * (BASELINE - PLOT_TOP);
  const band = (PLOT_RIGHT - PLOT_LEFT) / months.length;

  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, index) => {
    const value = step * index;
    const y = BASELINE - scale(value);
    return `<line x1="${PLOT_LEFT}" y1="${y}" x2="${PLOT_RIGHT}" y2="${y}" class="grid"/><text x="${PLOT_LEFT - 12}" y="${y + 4}" class="tick" text-anchor="end">${value}</text>`;
  }).join("");

  const columns = months
    .map((month, index) => {
      const centre = PLOT_LEFT + band * index + band / 2;
      const isLatest = index === months.length - 1;
      const showValue = isLatest || (month.commits === peak && peak > 0);
      const valueLabel = showValue ? `<text x="${centre}" y="${BASELINE - scale(month.commits) - 8}" class="num" text-anchor="middle">${month.commits}</text>` : "";
      return (
        column(centre - 12, BASELINE, 24, scale(month.commits), 4, isLatest ? palette.accent : palette.data) +
        valueLabel +
        `<text x="${centre}" y="${BASELINE + 22}" class="tick" text-anchor="middle">${monthLabel(month.month)}</text>`
      );
    })
    .join("");

  const first = months[0];
  const last = months[months.length - 1];
  const range = first && last ? `${monthYearLabel(first.month)} – ${monthYearLabel(last.month)} · ${monthLabel(last.month)} TO DATE` : "";

  return frame({
    palette,
    width: WIDTH,
    height: 252,
    label: "Commits by month",
    body: `\n${header(WIDTH, "COMMITS BY MONTH", range)}\n${ticks}\n${columns}\n`,
  });
};
