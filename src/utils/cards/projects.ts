import { ProjectCommits } from "../../interface";
import { bar, escapeXml, formatNumber, frame, header } from "./svg";
import { Palette } from "./theme";

const WIDTH = 400;
const [BAR_LEFT, BAR_MAX, ROW_TOP, MAX_ROWS] = [160, 168, 88, 5];

export const renderProjects = (projects: ProjectCommits[], palette: Palette) => {
  const rows = [...projects].sort((a, b) => b.commits - a.commits).slice(0, MAX_ROWS);
  const max = Math.max(1, ...rows.map(project => project.commits));
  const step = rows.length > 1 ? Math.min(36, 168 / (rows.length - 1)) : 0;

  const body = rows
    .map((project, index) => {
      const y = ROW_TOP + index * step;
      const width = Math.max(2, (project.commits / max) * BAR_MAX);
      return (
        `<text x="24" y="${y + 4}" class="name">${escapeXml(project.name)}</text>` +
        `<text x="${BAR_LEFT - 12}" y="${y + 4}" class="label" text-anchor="end">${project.type}</text>` +
        bar(BAR_LEFT, y - 6, width, 12, 4, palette.data) +
        `<text x="${BAR_LEFT + width + 8}" y="${y + 4}" class="num">${formatNumber(project.commits)}</text>`
      );
    })
    .join("");

  return frame({
    palette,
    width: WIDTH,
    height: 300,
    label: "Commits by project",
    body: `
${header(WIDTH, "WHERE MY COMMITS GO", "ALL TIME")}
${body}
<line x1="24" y1="260" x2="376" y2="260" class="rule"/>
<text x="24" y="282" class="label">ORG = ORGANISATION REPO · OWN = PERSONAL</text>
`,
  });
};
