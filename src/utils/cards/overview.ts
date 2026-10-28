import { ActivitySummary, Streak } from "../../interface";
import { dayRangeLabel } from "../dates";
import { estimateWidth, formatNumber, frame, header, plural } from "./svg";
import { Palette } from "./theme";

const WIDTH = 816;

const streakRange = (streak: Streak) => (streak.start && streak.end ? dayRangeLabel(streak.start, streak.end) : "NONE YET");

const streakValue = (x: number, streak: Streak) =>
  `<text x="${x}" y="124"><tspan class="value">${streak.length}</tspan><tspan class="unit" dx="6">${plural(streak.length, "day")}</tspan></text>`;

export const renderOverview = (summary: ActivitySummary, palette: Palette, login: string) => {
  const hero = formatNumber(summary.commits);
  const unitX = Math.round(24 + estimateWidth(hero, 56) + 10);

  return frame({
    palette,
    width: WIDTH,
    height: 184,
    label: `${hero} commits in the past twelve months`,
    body: `
${header(WIDTH, `PAST 12 MONTHS · @${login.toUpperCase()}`, "PERSONAL + ORGANISATION REPOS")}
<text x="24" y="122" class="hero">${hero}</text>
<text x="${unitX}" y="122" class="unit">${plural(summary.commits, "commit")}</text>
<text x="24" y="156" class="body">Personal and organisation repos, public and private.</text>
<line x1="408" y1="68" x2="408" y2="164" class="rule"/>
<text x="432" y="86" class="label">ACTIVE DAYS</text>
<text x="432" y="124" class="value">${summary.activeDays}</text>
<text x="432" y="152" class="label">OF ${summary.windowDays} DAYS</text>
<text x="552" y="86" class="label">LONGEST STREAK</text>
${streakValue(552, summary.longest)}
<text x="552" y="152" class="label">${streakRange(summary.longest)}</text>
<circle cx="672" cy="82" r="3.5" fill="${palette.accent}"/>
<text x="682" y="86" class="label">CURRENT</text>
${streakValue(672, summary.current)}
<text x="672" y="152" class="label">${streakRange(summary.current)}</text>
`,
  });
};
