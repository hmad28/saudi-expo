import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const pepper = () => {
  if (!process.env.TOKEN_PEPPER) throw new Error("TOKEN_PEPPER is required");
  return process.env.TOKEN_PEPPER;
};

export const createPublicToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

export const hashToken = (token) => createHash("sha256").update(`${token}:${pepper()}`).digest("hex");

export const createDerivedToken = (scope, id) => createHmac("sha256", pepper()).update(`${scope}:${id}`).digest("base64url");

export const safeEqual = (left, right) => {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
};

export const getRequestIp = (request) => String(request.headers["x-forwarded-for"] || request.socket?.remoteAddress || "unknown").split(",")[0].trim();

export function requireSameOrigin(request, response, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return next();
  const origin = request.get("origin");
  const allowed = new Set([
    process.env.APP_URL,
    process.env.BETTER_AUTH_URL,
    request.get("host") ? `${request.secure ? "https" : "http"}://${request.get("host")}` : null,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean).map((value) => new URL(value).origin));
  if (!origin || !allowed.has(origin)) return response.status(403).json({ error: "Permintaan ditolak karena origin tidak valid." });
  next();
}
