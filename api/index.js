import express from "express";
import helmet from "helmet";
import { ZodError, z } from "zod";
import { sql } from "drizzle-orm";
import { toNodeHandler } from "better-auth/node";
import { createRouteHandler } from "uploadthing/express";
import { auth, requireRole } from "../server/auth.js";
import { db } from "../server/db/index.js";
import { consumeRateLimit } from "../server/rate-limit.js";
import { requireSameOrigin } from "../server/security.js";
import { createUploadIntent, createPrivateFileUrl, listMediaAssets, uploadRouter } from "../server/services/uploads.js";
import { createApplication, getApplication, listApplications, reviewApplication } from "../server/services/applications.js";
import { confirmCheckin, createOrder, expireOrders, getOrder, getTicket, listAdminOrders, listProducts, reviewPayment, submitPaymentProof, validateCheckin } from "../server/services/ticketing.js";

const app = express();
app.set("trust proxy", 1);

app.use((request, _response, next) => {
  if (typeof request.query.path === "string") {
    const query = new URLSearchParams(request.query);
    query.delete("path");
    request.url = `/api/${request.query.path}${query.size ? `?${query}` : ""}`;
  }
  next();
});

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/uploadthing", createRouteHandler({ router: uploadRouter }));
app.use(express.json({ limit: "256kb" }));
app.use("/api", requireSameOrigin);

const route = (handler) => async (request, response, next) => {
  try { await handler(request, response); } catch (error) { next(error); }
};
const throttle = (scope, limit, windowSeconds) => async (request, response, next) => {
  try {
    const result = await consumeRateLimit(`${scope}:${request.ip}`, limit, windowSeconds);
    if (!result.allowed) return response.status(429).json({ error: "Terlalu banyak permintaan. Coba lagi sebentar." });
    response.locals.rateLimitPassed = true;
    next();
  } catch (error) { next(error); }
};

app.get("/api/health", route(async (_request, response) => {
  await db.execute(sql`select 1`);
  response.json({ ok: true, timestamp: new Date().toISOString() });
}));
app.get("/api/products", route(async (_request, response) => response.json({ data: await listProducts() })));
app.post("/api/orders", throttle("order", 8, 600), route(async (request, response) => {
  if (!response.locals.rateLimitPassed) return;
  response.status(201).json({ data: await createOrder(request.body, request.get("idempotency-key"), request) });
}));
app.get("/api/orders/:token", route(async (request, response) => {
  const order = await getOrder(request.params.token);
  if (!order) return response.status(404).json({ error: "Pesanan tidak ditemukan." });
  response.json({ data: order });
}));
app.post("/api/orders/:token/proof", throttle("payment-proof", 10, 600), route(async (request, response) => {
  if (!response.locals.rateLimitPassed) return;
  response.json({ data: await submitPaymentProof(request.params.token, request.body, request) });
}));
app.post("/api/upload-intents", throttle("upload-intent", 15, 600), route(async (request, response) => {
  if (!response.locals.rateLimitPassed) return;
  response.status(201).json({ data: await createUploadIntent(request.body) });
}));
app.get("/api/tickets/:token", route(async (request, response) => {
  const ticket = await getTicket(request.params.token);
  if (!ticket) return response.status(404).json({ error: "Tiket tidak ditemukan." });
  response.json({ data: ticket });
}));
app.get("/api/checkins/:token", requireRole("ADMIN", "CHECKIN"), route(async (request, response) => response.json({ data: await validateCheckin(request.params.token) })));
app.post("/api/checkins/:token", requireRole("ADMIN", "CHECKIN"), route(async (request, response) => response.json({ data: await confirmCheckin(request.params.token, request.auth.user, request) })));

app.post("/api/applications", throttle("application", 6, 3600), route(async (request, response) => {
  if (!response.locals.rateLimitPassed) return;
  response.status(201).json({ data: await createApplication(request.body, request) });
}));
app.get("/api/applications/:token", route(async (request, response) => {
  const application = await getApplication(request.params.token);
  if (!application) return response.status(404).json({ error: "Pengajuan tidak ditemukan." });
  response.json({ data: application });
}));

app.get("/api/admin/overview", requireRole("ADMIN", "FINANCE", "VIEWER"), route(async (_request, response) => {
  const [orders, applications, media] = await Promise.all([listAdminOrders(), listApplications(), listMediaAssets()]);
  response.json({ data: { orders, applications, media } });
}));
app.post("/api/admin/upload-intents", requireRole("ADMIN"), route(async (request, response) => {
  response.status(201).json({ data: await createUploadIntent(request.body, { allowMedia: true }) });
}));
app.post("/api/admin/orders/:id/review", requireRole("ADMIN", "FINANCE"), route(async (request, response) => {
  const body = z.object({ decision: z.enum(["APPROVE", "REJECT"]), reason: z.string().max(500).optional().default("") }).parse(request.body);
  response.json({ data: await reviewPayment(request.params.id, body.decision, body.reason, request.auth.user, request) });
}));
app.post("/api/admin/applications/:id/status", requireRole("ADMIN"), route(async (request, response) => {
  const body = z.object({ status: z.enum(["UNDER_REVIEW", "APPROVED", "CONFIRMED", "REJECTED"]) }).parse(request.body);
  response.json({ data: await reviewApplication(request.params.id, body.status, request.auth.user, request) });
}));
app.get("/api/admin/files/:key", requireRole("ADMIN", "FINANCE"), route(async (request, response) => response.json({ data: { url: await createPrivateFileUrl(request.params.key) } })));

app.get("/api/cron/expire", route(async (request, response) => {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.get("authorization") !== `Bearer ${expected}`) return response.status(401).json({ error: "Unauthorized" });
  response.json({ data: { expired: await expireOrders() } });
}));

app.use((error, _request, response, _next) => {
  if (error instanceof ZodError) return response.status(400).json({ error: "Data belum valid.", details: error.flatten() });
  const status = Number(error.status || error.statusCode) || 500;
  if (status >= 500) console.error(error);
  response.status(status).json({ error: status >= 500 ? "Terjadi gangguan pada server." : error.message });
});

export default app;
