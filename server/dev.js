import { config } from "dotenv";

config({ path: ".env.local" });
const { default: app } = await import("../api/index.js");

const port = Number(process.env.PORT || 3001);
app.listen(port, "127.0.0.1", () => console.log(`SEE API listening on http://127.0.0.1:${port}`));
