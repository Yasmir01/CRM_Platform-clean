import express from "express";
import cors from "cors";
import { router as integrations } from "./integrations/router";
import workOrdersRouter from "./routes/workorders";
import pushRouter from "./routes/push";
import leaseDocsRouter from "./routes/leaseDocs";
import adminComplianceRouter from "./routes/adminCompliance";

const app = express();
app.use(cors({ origin: process.env.APP_URL || "*" }));
app.use(express.json());
app.use((req, _res, next) => {
  (req as any).isOfflineSync = req.headers["x-origin"] === "offline-sync";
  next();
});

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/integrations", integrations);
app.use("/api/workorders", workOrdersRouter);
app.use("/api/push", pushRouter);
app.use("/api/leases", leaseDocsRouter);
app.use("/api/admin/compliance", adminComplianceRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${PORT}`);
});
