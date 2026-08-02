import { sql } from "drizzle-orm";
import { db } from "./db/index.js";
import { rateLimits } from "./db/schema.js";
import { getRequestIp } from "./security.js";

export function databaseRateLimit(action, { limit = 10, windowSeconds = 60 } = {}) {
  return async (request, response, next) => {
    const windowEndsAt = new Date(Date.now() + windowSeconds * 1000);
    const key = `${action}:${getRequestIp(request)}`;
    try {
      const [entry] = await db.insert(rateLimits).values({ key, windowEndsAt }).onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`case when ${rateLimits.windowEndsAt} <= now() then 1 else ${rateLimits.count} + 1 end`,
          windowEndsAt: sql`case when ${rateLimits.windowEndsAt} <= now() then ${windowEndsAt} else ${rateLimits.windowEndsAt} end`,
          updatedAt: new Date(),
        },
      }).returning();
      if (entry.count > limit && entry.windowEndsAt > new Date()) return response.status(429).json({ error: "Terlalu banyak permintaan. Coba lagi beberapa saat." });
      next();
    } catch (error) {
      next(error);
    }
  };
}

export async function consumeRateLimit(key, limit = 10, windowSeconds = 60) {
  const windowEndsAt = new Date(Date.now() + windowSeconds * 1000);
  const [entry] = await db.insert(rateLimits).values({ key, windowEndsAt }).onConflictDoUpdate({
    target: rateLimits.key,
    set: {
      count: sql`case when ${rateLimits.windowEndsAt} <= now() then 1 else ${rateLimits.count} + 1 end`,
      windowEndsAt: sql`case when ${rateLimits.windowEndsAt} <= now() then ${windowEndsAt} else ${rateLimits.windowEndsAt} end`,
      updatedAt: new Date(),
    },
  }).returning();
  return { allowed: entry.count <= limit || entry.windowEndsAt <= new Date(), retryAt: entry.windowEndsAt };
}
