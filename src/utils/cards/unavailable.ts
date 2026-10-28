import { frame, header } from "./svg";
import { Palette } from "./theme";

export const renderUnavailable = (palette: Palette) =>
  frame({
    palette,
    width: 400,
    height: 120,
    label: "Stats are temporarily unavailable",
    body: `
${header(400, "GITHUB ACTIVITY")}
<text x="24" y="88" class="body">Stats are temporarily unavailable. Check back shortly.</text>
`,
  });
