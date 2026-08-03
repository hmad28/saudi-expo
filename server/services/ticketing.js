import { and, desc, eq, inArray, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { attendees, auditLogs, checkins, orders, payments, products, tickets, uploadIntents } from "../db/schema.js";
import { createDerivedToken, createPublicToken, getRequestIp, hashToken } from "../security.js";
import { orderCreatedEmail, paymentApprovedEmail } from "../mail.js";
import { CHECKOUT_CONFIG, EVENT } from "../../src/data/eventConfig.js";

const buyerSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^(\+?62|0)8\d{7,12}$/),
  email: z.email().transform((value) => value.toLowerCase()),
  ageRange: z.string().max(50),
  institutionLevel: z.string().max(100),
  institutionName: z.string().max(180).optional().default(""),
  category: z.string().max(100),
});

const attendeeSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(24).optional().default(""),
  email: z.union([z.literal(""), z.email()]).optional().default(""),
  gender: z.enum(["Laki-laki", "Perempuan"]),
  birthDate: z.string().max(10).optional().default(""),
  guardianName: z.string().trim().max(120).optional().default(""),
  ageRange: z.string().max(50),
  institutionLevel: z.string().max(100),
  institutionName: z.string().max(180).optional().default(""),
  category: z.string().max(100),
});

export const orderInputSchema = z.object({
  productId: z.string().min(1).max(80),
  quantity: z.number().int().min(1).max(10),
  buyer: buyerSchema,
  attendees: z.array(attendeeSchema).min(1).max(10),
  donation: z.number().int().min(0).max(10_000_000).default(0),
  voucherCode: z.string().trim().max(40).optional().default(""),
  requestToken: z.string().min(32).max(128),
}).superRefine((value, context) => {
  if (value.attendees.length !== value.quantity) context.addIssue({ code: "custom", path: ["attendees"], message: "Jumlah data pengunjung tidak sesuai." });
});

const normalizePhone = (input) => {
  const digits = String(input || "").replace(/\D/g, "");
  if (digits.startsWith("08")) return `+62${digits.slice(1)}`;
  if (digits.startsWith("628")) return `+${digits}`;
  return input;
};

const orderNumber = () => {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: EVENT.timezone }).format(new Date()).replaceAll("-", "");
  return `SEE26/${date}/${createPublicToken(5).slice(0, 8).toUpperCase()}`;
};

const productSaleState = (product, now = new Date()) => product.status === "AVAILABLE" && (!product.saleStartsAt || product.saleStartsAt <= now) && (!product.saleEndsAt || product.saleEndsAt >= now);

export async function listProducts() {
  await expireOrders();
  return db.select().from(products).orderBy(products.category, products.price);
}

export async function createOrder(input, idempotencyKey, request) {
  const parsed = orderInputSchema.parse(input);
  if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128) throw Object.assign(new Error("Idempotency-Key tidak valid."), { status: 400 });
  if (hashToken(parsed.requestToken).length !== 64) throw Object.assign(new Error("Token pesanan tidak valid."), { status: 400 });
  const existing = await db.query.orders.findFirst({ where: eq(orders.idempotencyKey, idempotencyKey) });
  if (existing) {
    if (existing.publicTokenHash !== hashToken(parsed.requestToken)) throw Object.assign(new Error("Idempotency-Key sudah digunakan."), { status: 409 });
    return getOrder(parsed.requestToken);
  }

  const product = await db.query.products.findFirst({ where: eq(products.id, parsed.productId) });
  if (!product || !productSaleState(product)) throw Object.assign(new Error("Tiket sudah tidak tersedia pada waktu ini."), { status: 409 });
  if (product.remaining !== null && product.remaining < parsed.quantity) throw Object.assign(new Error("Stok tiket tidak mencukupi."), { status: 409 });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + CHECKOUT_CONFIG.paymentExpirationMinutes * 60_000);
  const uniqueCode = CHECKOUT_CONFIG.payment.uniqueCodeEnabled ? 100 + crypto.getRandomValues(new Uint16Array(1))[0] % 900 : 0;
  const subtotal = product.price * parsed.quantity;
  const total = subtotal + parsed.donation + uniqueCode;
  const id = crypto.randomUUID();
  const number = orderNumber();
  const orderValues = {
    id,
    orderNumber: number,
    publicTokenHash: hashToken(parsed.requestToken),
    idempotencyKey,
    productId: product.id,
    productSnapshot: { id: product.id, name: product.name, date: product.dateLabel, validDates: product.validDates, unitPrice: product.price, validity: product.dateLabel, version: product.version },
    quantity: parsed.quantity,
    buyerName: parsed.buyer.fullName,
    buyerPhone: normalizePhone(parsed.buyer.phone),
    buyerEmail: parsed.buyer.email,
    buyerMetadata: { ageRange: parsed.buyer.ageRange, institutionLevel: parsed.buyer.institutionLevel, institutionName: parsed.buyer.institutionName, category: parsed.buyer.category },
    subtotal,
    donation: parsed.donation,
    uniqueCode,
    total,
    expiresAt,
    acceptedTermsVersion: CHECKOUT_CONFIG.termsVersion,
    acceptedTermsAt: now,
  };

  const created = await db.transaction(async (tx) => {
    if (product.remaining !== null) {
      const [reserved] = await tx.update(products).set({ remaining: sql`${products.remaining} - ${parsed.quantity}`, updatedAt: now }).where(and(eq(products.id, product.id), sql`${products.remaining} >= ${parsed.quantity}`)).returning({ id: products.id });
      if (!reserved) throw Object.assign(new Error("Stok tiket baru saja habis."), { status: 409 });
    }
    const [createdOrder] = await tx.insert(orders).values(orderValues).returning();
    await tx.insert(attendees).values(parsed.attendees.map((person, position) => ({
      orderId: createdOrder.id,
      position,
      fullName: person.fullName,
      phone: person.phone ? normalizePhone(person.phone) : null,
      email: person.email || null,
      gender: person.gender,
      birthDate: person.birthDate || null,
      guardianName: person.guardianName || null,
      metadata: { ageRange: person.ageRange, institutionLevel: person.institutionLevel, institutionName: person.institutionName, category: person.category },
    })));
    await tx.insert(payments).values({ orderId: createdOrder.id });
    await tx.insert(auditLogs).values({ action: "ORDER_CREATED", entityType: "ORDER", entityId: createdOrder.id, ipAddress: getRequestIp(request), userAgent: request.get("user-agent") || null });
    return createdOrder;
  });

  orderCreatedEmail(created, parsed.requestToken).catch(() => undefined);
  return serializeOrder(created, parsed.requestToken);
}

export async function getOrder(publicToken) {
  await expireOrders();
  const order = await db.query.orders.findFirst({ where: eq(orders.publicTokenHash, hashToken(publicToken)) });
  if (!order) return null;
  const [people, paymentRows, issuedTickets] = await Promise.all([
    db.select().from(attendees).where(eq(attendees.orderId, order.id)).orderBy(attendees.position),
    db.select().from(payments).where(eq(payments.orderId, order.id)).orderBy(desc(payments.createdAt)).limit(1),
    db.select().from(tickets).where(eq(tickets.orderId, order.id)).orderBy(tickets.issuedAt),
  ]);
  return serializeOrder(order, publicToken, { people, payment: paymentRows[0], issuedTickets });
}

export async function submitPaymentProof(publicToken, input, request) {
  const parsed = z.object({
    claimedAmount: z.number().int().positive(),
    transferredAt: z.coerce.date(),
    uploadIntentToken: z.string().min(32).max(128),
  }).parse(input);
  const order = await db.query.orders.findFirst({ where: eq(orders.publicTokenHash, hashToken(publicToken)) });
  if (!order || !["PENDING_PAYMENT", "PAYMENT_REJECTED"].includes(order.status) || order.expiresAt <= new Date()) throw Object.assign(new Error("Waktu pembayaran telah berakhir."), { status: 409 });
  const intent = await db.query.uploadIntents.findFirst({ where: eq(uploadIntents.tokenHash, hashToken(parsed.uploadIntentToken)) });
  if (!intent || intent.purpose !== "PAYMENT_PROOF" || intent.ownerReference !== order.id || !intent.completedAt || intent.consumedAt || intent.expiresAt <= new Date()) throw Object.assign(new Error("Bukti upload tidak valid atau sudah digunakan."), { status: 400 });
  if (parsed.transferredAt < new Date(order.createdAt.getTime() - 5 * 60_000) || parsed.transferredAt > new Date(Date.now() + 5 * 60_000)) throw Object.assign(new Error("Waktu transfer tidak valid."), { status: 400 });

  await db.transaction(async (tx) => {
    await tx.update(payments).set({
      status: "UNDER_REVIEW",
      claimedAmount: parsed.claimedAmount,
      transferredAt: parsed.transferredAt,
      proofKey: intent.fileKey,
      proofUrl: intent.fileUrl,
      proofName: intent.fileName,
      proofType: intent.fileType,
      proofSize: intent.fileSize,
      updatedAt: new Date(),
    }).where(eq(payments.orderId, order.id));
    await tx.update(orders).set({ status: "PAYMENT_REVIEW", paymentStatus: "UNDER_REVIEW", updatedAt: new Date() }).where(eq(orders.id, order.id));
    await tx.update(uploadIntents).set({ consumedAt: new Date() }).where(eq(uploadIntents.id, intent.id));
    await tx.insert(auditLogs).values({ action: "PAYMENT_PROOF_SUBMITTED", entityType: "ORDER", entityId: order.id, ipAddress: getRequestIp(request), userAgent: request.get("user-agent") || null });
  });
  return getOrder(publicToken);
}

export async function listAdminOrders() {
  await expireOrders();
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
  const orderIds = rows.map((row) => row.id);
  const proofRows = orderIds.length ? await db.select().from(payments).where(inArray(payments.orderId, orderIds)) : [];
  const proofMap = new Map(proofRows.map((payment) => [payment.orderId, payment]));
  return rows.map((order) => serializeOrder(order, null, { payment: proofMap.get(order.id), admin: true }));
}

export async function reviewPayment(orderId, decision, reason, currentUser, request) {
  if (!["APPROVE", "REJECT"].includes(decision)) throw Object.assign(new Error("Keputusan tidak valid."), { status: 400 });
  const result = await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
    if (!order || order.status !== "PAYMENT_REVIEW") throw Object.assign(new Error("Pembayaran tidak sedang menunggu review."), { status: 409 });
    const now = new Date();
    if (decision === "REJECT") {
      await tx.update(orders).set({ status: "PAYMENT_REJECTED", paymentStatus: "REJECTED", updatedAt: now }).where(eq(orders.id, order.id));
      await tx.update(payments).set({ status: "REJECTED", rejectionReason: reason || "Bukti pembayaran perlu diperbaiki.", reviewedBy: currentUser.id, reviewedAt: now, updatedAt: now }).where(eq(payments.orderId, order.id));
      await tx.insert(auditLogs).values({ actorId: currentUser.id, action: "PAYMENT_REJECTED", entityType: "ORDER", entityId: order.id, ipAddress: getRequestIp(request), metadata: { reason } });
      return { order, ticketLinks: [] };
    }
    const people = await tx.select().from(attendees).where(eq(attendees.orderId, order.id)).orderBy(attendees.position);
    const ticketRows = people.map((person) => {
      const id = crypto.randomUUID();
      return {
        id,
        orderId: order.id,
        attendeeId: person.id,
        accessTokenHash: hashToken(createDerivedToken("ticket-access", id)),
        checkinTokenHash: hashToken(createDerivedToken("ticket-checkin", id)),
        code: `SEE26-${order.productId.toUpperCase()}-${id.replaceAll("-", "").slice(0, 8).toUpperCase()}`,
      };
    });
    if (ticketRows.length) await tx.insert(tickets).values(ticketRows);
    await tx.update(orders).set({ status: "PAID", paymentStatus: "SUCCESS", paidAt: now, updatedAt: now }).where(eq(orders.id, order.id));
    await tx.update(payments).set({ status: "SUCCESS", reviewedBy: currentUser.id, reviewedAt: now, updatedAt: now }).where(eq(payments.orderId, order.id));
    await tx.insert(auditLogs).values({ actorId: currentUser.id, action: "PAYMENT_APPROVED", entityType: "ORDER", entityId: order.id, ipAddress: getRequestIp(request) });
    return { order, ticketLinks: ticketRows.map((ticket) => `${process.env.APP_URL}/ticket/${createDerivedToken("ticket-access", ticket.id)}`) };
  });
  if (decision === "APPROVE") paymentApprovedEmail(result.order, result.ticketLinks).catch(() => undefined);
  return { success: true };
}

export async function getTicket(accessToken) {
  const ticket = await db.query.tickets.findFirst({ where: eq(tickets.accessTokenHash, hashToken(accessToken)) });
  if (!ticket) return null;
  const [order, person, history] = await Promise.all([
    db.query.orders.findFirst({ where: eq(orders.id, ticket.orderId) }),
    db.query.attendees.findFirst({ where: eq(attendees.id, ticket.attendeeId) }),
    db.select().from(checkins).where(eq(checkins.ticketId, ticket.id)).orderBy(checkins.createdAt),
  ]);
  return serializeTicket(ticket, order, person, history);
}

export async function validateCheckin(checkinToken) {
  const ticket = await db.query.tickets.findFirst({ where: eq(tickets.checkinTokenHash, hashToken(checkinToken)) });
  if (!ticket || ticket.status !== "ACTIVE") return { success: false, message: "Tiket tidak aktif atau tidak ditemukan." };
  const [order, person] = await Promise.all([
    db.query.orders.findFirst({ where: eq(orders.id, ticket.orderId) }),
    db.query.attendees.findFirst({ where: eq(attendees.id, ticket.attendeeId) }),
  ]);
  const eventDate = new Intl.DateTimeFormat("en-CA", { timeZone: EVENT.timezone }).format(new Date());
  if (!order.productSnapshot.validDates.includes(eventDate)) return { success: false, message: "Tiket tidak berlaku pada tanggal ini.", ticket: serializeTicket(ticket, order, person, []) };
  const offset = EVENT.utcOffset || "+07:00";
  const now = Date.now();
  const gateOpensAt = new Date(`${eventDate}T${EVENT.timing.eventGateOpen}:00${offset}`).getTime();
  const eventEndsAt = new Date(`${eventDate}T${EVENT.timing.eventEnd}:00${offset}`).getTime();
  if (now < gateOpensAt) return { success: false, message: `Check-in dibuka pukul ${EVENT.timing.eventGateOpen} WIB.`, ticket: serializeTicket(ticket, order, person, []) };
  if (now > eventEndsAt) return { success: false, message: "Waktu check-in untuk hari ini telah berakhir.", ticket: serializeTicket(ticket, order, person, []) };
  const previous = await db.query.checkins.findFirst({ where: and(eq(checkins.ticketId, ticket.id), eq(checkins.eventDate, eventDate)) });
  if (previous) return { success: false, message: "Tiket sudah digunakan hari ini.", ticket: serializeTicket(ticket, order, person, [previous]), previous };
  return { success: true, message: "Tiket valid dan belum digunakan hari ini.", ticket: serializeTicket(ticket, order, person, []), eventDate };
}

export async function confirmCheckin(checkinToken, currentUser, request) {
  const validation = await validateCheckin(checkinToken);
  if (!validation.success) return validation;
  const ticket = await db.query.tickets.findFirst({ where: eq(tickets.checkinTokenHash, hashToken(checkinToken)) });
  try {
    const [record] = await db.insert(checkins).values({ ticketId: ticket.id, eventDate: validation.eventDate, operatorId: currentUser.id }).returning();
    await db.insert(auditLogs).values({ actorId: currentUser.id, action: "TICKET_CHECKED_IN", entityType: "TICKET", entityId: ticket.id, ipAddress: getRequestIp(request), metadata: { eventDate: validation.eventDate } });
    return { ...validation, message: "Tiket valid. Check-in berhasil.", previous: record };
  } catch (error) {
    if (error.cause?.code === "23505" || error.code === "23505") return validateCheckin(checkinToken);
    throw error;
  }
}

export async function expireOrders() {
  const stale = await db.select().from(orders).where(and(inArray(orders.status, ["PENDING_PAYMENT", "PAYMENT_REJECTED"]), lte(orders.expiresAt, new Date())));
  if (!stale.length) return 0;
  await db.transaction(async (tx) => {
    for (const order of stale) {
      const [expired] = await tx.update(orders).set({ status: "EXPIRED", paymentStatus: "EXPIRED", updatedAt: new Date() }).where(and(eq(orders.id, order.id), inArray(orders.status, ["PENDING_PAYMENT", "PAYMENT_REJECTED"]), lte(orders.expiresAt, new Date()))).returning({ id: orders.id });
      if (!expired) continue;
      const product = await tx.query.products.findFirst({ where: eq(products.id, order.productId) });
      if (product?.remaining !== null) await tx.update(products).set({ remaining: sql`${products.remaining} + ${order.quantity}`, updatedAt: new Date() }).where(eq(products.id, order.productId));
      await tx.update(payments).set({ status: "EXPIRED", updatedAt: new Date() }).where(eq(payments.orderId, order.id));
      await tx.insert(auditLogs).values({ action: "ORDER_EXPIRED", entityType: "ORDER", entityId: order.id });
    }
  });
  return stale.length;
}

function serializeOrder(order, publicToken, { people = [], payment, issuedTickets = [], admin = false } = {}) {
  return {
    id: admin ? order.id : undefined,
    publicToken,
    orderNumber: order.orderNumber,
    productId: order.productId,
    productSnapshot: order.productSnapshot,
    quantity: order.quantity,
    buyer: { fullName: order.buyerName, phone: order.buyerPhone, email: order.buyerEmail, ...order.buyerMetadata },
    attendees: people.map((person) => ({ id: person.id, fullName: person.fullName, phone: person.phone || "", email: person.email || "", gender: person.gender, birthDate: person.birthDate || "", guardianName: person.guardianName || "", ...person.metadata })),
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    donation: order.donation,
    serviceFee: order.serviceFee,
    uniqueCode: order.uniqueCode,
    total: order.total,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    expiresAt: order.expiresAt,
    paidAt: order.paidAt,
    rejectionReason: payment?.rejectionReason || null,
    proof: payment?.proofKey ? { key: payment.proofKey, url: admin ? payment.proofUrl : undefined, name: payment.proofName, type: payment.proofType, size: payment.proofSize, claimedAmount: payment.claimedAmount, transferredAt: payment.transferredAt } : null,
    tickets: issuedTickets.map((ticket) => ({
      id: ticket.id,
      code: ticket.code,
      accessToken: createDerivedToken("ticket-access", ticket.id),
      attendee: people.find((person) => person.id === ticket.attendeeId)
        ? { fullName: people.find((person) => person.id === ticket.attendeeId).fullName }
        : { fullName: "Pengunjung" },
    })),
  };
}

function serializeTicket(ticket, order, person, history) {
  return {
    id: ticket.id,
    code: ticket.code,
    status: ticket.status,
    checkinToken: createDerivedToken("ticket-checkin", ticket.id),
    attendee: { fullName: person.fullName, gender: person.gender, ...person.metadata },
    checkIns: history.map((record) => ({ ...record, at: record.createdAt })),
    order: {
      orderNumber: order.orderNumber,
      productSnapshot: order.productSnapshot,
      total: order.total,
      paidAt: order.paidAt,
    },
  };
}
