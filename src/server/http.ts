import express from "express";
import cors from "cors";
import { router as integrations } from "./integrations/router";

const app = express();
app.use(cors({ origin: process.env.APP_URL || "*" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/integrations", integrations);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});
