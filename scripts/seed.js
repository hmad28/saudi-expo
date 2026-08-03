import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { TICKETS } from "../src/data/eventConfig.js";

config({ path: ".env.local" });
const [{ db }, { products, user }, { auth }] = await Promise.all([
  import("../server/db/index.js"),
  import("../server/db/schema.js"),
  import("../server/auth.js"),
]);

const eventEndsAt = new Date("2026-08-02T18:00:00+07:00");
for (const ticket of TICKETS) {
  const lastDate = ticket.validDates.at(-1);
  const saleEndsAt = new Date(`${lastDate}T18:00:00+07:00`);
  const values = {
    id: ticket.id,
    category: ticket.category,
    name: ticket.name,
    dateLabel: ticket.date,
    validDates: ticket.validDates,
    price: ticket.price,
    originalPrice: ticket.originalPrice || null,
    unit: ticket.unit,
    status: ticket.status,
    remaining: ticket.remaining ?? null,
    benefits: ticket.benefits,
    metadata: { ...ticket, status: undefined, remaining: undefined },
    saleEndsAt: saleEndsAt > eventEndsAt ? eventEndsAt : saleEndsAt,
    updatedAt: new Date(),
  };
  await db.insert(products).values(values).onConflictDoUpdate({ target: products.id, set: values });
}

if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ALLOW_ADMIN_BOOTSTRAP === "true") {
  const email = process.env.ADMIN_EMAIL.toLowerCase();
  const existing = await db.query.user.findFirst({ where: eq(user.email, email) });
  if (!existing) {
    const result = await auth.api.signUpEmail({ body: { name: "SEE Administrator", email, password: process.env.ADMIN_PASSWORD } });
    await db.update(user).set({ role: "ADMIN", emailVerified: true, updatedAt: new Date() }).where(eq(user.id, result.user.id));
  }
}

console.log(`Seed complete: ${TICKETS.length} products synchronized.`);
process.exit(0);
