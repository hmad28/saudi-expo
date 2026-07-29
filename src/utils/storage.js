import { CHECKOUT_CONFIG, EVENT, TICKETS } from "../data/eventConfig";

const STORAGE_KEY = "SEE26_TICKETING_DEMO_V3";
const randomToken = (bytes = 18) => {
  const data = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(data, (value) => value.toString(36).padStart(2, "0")).join("");
};
const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: EVENT.timezone }).format(new Date());

export function getDatabase() {
  try {
    const database = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { orders: [], auditLogs: [] };
    const expired = applyOrderExpiry(database);
    if (expired) localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
    return database;
  } catch {
    return { orders: [], auditLogs: [] };
  }
}

function applyOrderExpiry(database) {
  const now = Date.now();
  let changed = false;
  database.orders.forEach((order) => {
    if (["PENDING_PAYMENT", "PAYMENT_REJECTED"].includes(order.status) && new Date(order.expiresAt).getTime() <= now) {
      order.status = "EXPIRED";
      order.paymentStatus = "EXPIRED";
      order.expiredAt = new Date(now).toISOString();
      database.auditLogs.unshift({ at: order.expiredAt, action: "ORDER_EXPIRED", entityId: order.id });
      changed = true;
    }
  });
  return changed;
}

export function expireStaleOrders() {
  return getDatabase();
}

function saveDatabase(database) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  window.dispatchEvent(new Event("see26:database"));
}

export const formatRupiah = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0,
}).format(value);

export const formatDateTime = (value) => new Intl.DateTimeFormat("id-ID", {
  dateStyle: "full", timeStyle: "short", timeZone: EVENT.timezone,
}).format(new Date(value)).replace("pukul", "pukul") + " WIB";

export function createOrder({ productId, quantity, buyer, attendees, donation = 0, voucherCode = "", paymentMethod = "MANUAL_TRANSFER" }) {
  const product = TICKETS.find((item) => item.id === productId);
  if (!product || product.status !== "AVAILABLE") throw new Error("Tiket ini belum dapat dibeli.");
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error("Jumlah tiket tidak valid.");
  if (attendees.length !== quantity) throw new Error("Lengkapi data setiap pengunjung.");
  const subtotal = product.price * quantity;
  // No public voucher dataset has been supplied. Keep validation server-driven
  // and do not create a promotional code merely to complete the interface.
  const discountAmount = 0;
  const serviceFee = 0;
  const uniqueCode = paymentMethod === "MANUAL_TRANSFER" && CHECKOUT_CONFIG.payment.uniqueCodeEnabled
    ? 100 + (crypto.getRandomValues(new Uint16Array(1))[0] % 900) : 0;
  const total = subtotal - discountAmount + donation + serviceFee + uniqueCode;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CHECKOUT_CONFIG.paymentExpirationMinutes * 60000);
  const publicToken = randomToken();
  const order = {
    id: crypto.randomUUID(),
    orderNumber: `SEE26/${new Intl.DateTimeFormat("en-CA", { timeZone: EVENT.timezone }).format(now).replaceAll("-", "")}/${randomToken(4).slice(0, 8).toUpperCase()}`,
    publicToken,
    productId,
    productSnapshot: { name: product.name, date: product.date, validDates: product.validDates, unitPrice: product.price, validity: product.date },
    quantity,
    buyer: { ...buyer, email: buyer.email.trim().toLowerCase(), phone: normalizePhone(buyer.phone) },
    attendees,
    donation,
    voucherCode: voucherCode.trim().toUpperCase(),
    discountAmount,
    serviceFee,
    uniqueCode,
    subtotal,
    total,
    paymentMethod,
    status: "PENDING_PAYMENT",
    paymentStatus: "PENDING",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    acceptedTermsVersion: CHECKOUT_CONFIG.termsVersion,
    acceptedTermsAt: now.toISOString(),
    tickets: [],
    proof: null,
  };
  const database = getDatabase();
  database.orders.unshift(order);
  database.auditLogs.unshift({ at: now.toISOString(), action: "ORDER_CREATED", entityId: order.id });
  saveDatabase(database);
  return order;
}

export function submitPaymentProof(token, proof) {
  return updateOrder(token, (order, database) => {
    if (!["PENDING_PAYMENT", "PAYMENT_REJECTED"].includes(order.status) || new Date(order.expiresAt).getTime() <= Date.now()) throw new Error("Waktu pembayaran telah berakhir.");
    order.proof = proof;
    order.status = "PAYMENT_REVIEW";
    order.paymentStatus = "UNDER_REVIEW";
    database.auditLogs.unshift({ at: new Date().toISOString(), action: "PAYMENT_PROOF_SUBMITTED", entityId: order.id });
  });
}

export function approvePayment(token) {
  return updateOrder(token, (order, database) => {
    if (order.status !== "PAYMENT_REVIEW") throw new Error("Pembayaran tidak sedang menunggu review.");
    const paidAt = new Date().toISOString();
    order.status = "PAID";
    order.paymentStatus = "SUCCESS";
    order.paidAt = paidAt;
    order.tickets = order.attendees.map((attendee, index) => ({
      id: crypto.randomUUID(),
      accessToken: randomToken(),
      checkinToken: randomToken(),
      code: `SEE26-${order.productId.toUpperCase()}-${randomToken(3).slice(0, 6).toUpperCase()}`,
      attendee,
      status: "ACTIVE",
      checkIns: [],
      index,
    }));
    database.auditLogs.unshift({ at: paidAt, action: "MANUAL_PAYMENT_APPROVED", entityId: order.id, actor: "Development admin" });
  });
}

export function rejectPayment(token, reason = "Bukti pembayaran perlu diperbaiki.") {
  return updateOrder(token, (order, database) => {
    if (order.status !== "PAYMENT_REVIEW") throw new Error("Pembayaran tidak sedang menunggu review.");
    order.status = "PAYMENT_REJECTED";
    order.paymentStatus = "REJECTED";
    order.rejectionReason = reason;
    database.auditLogs.unshift({ at: new Date().toISOString(), action: "MANUAL_PAYMENT_REJECTED", entityId: order.id, reason });
  });
}

function updateOrder(token, mutate) {
  const database = getDatabase();
  const order = database.orders.find((item) => item.publicToken === token);
  if (!order) throw new Error("Pesanan tidak ditemukan.");
  mutate(order, database);
  saveDatabase(database);
  return order;
}

export const getOrderByToken = (token) => getDatabase().orders.find((order) => order.publicToken === token);
export const getOrderByTicketToken = (token) => getDatabase().orders.find((order) => order.tickets.some((ticket) => ticket.accessToken === token));
export const getTicketByToken = (token) => {
  const order = getOrderByTicketToken(token);
  return order ? { order, ticket: order.tickets.find((item) => item.accessToken === token) } : null;
};

export function validateCheckInToken(checkinToken) {
  const database = getDatabase();
  const order = database.orders.find((item) => item.tickets.some((ticket) => ticket.checkinToken === checkinToken));
  const ticket = order?.tickets.find((item) => item.checkinToken === checkinToken);
  if (!order || !ticket || ticket.status !== "ACTIVE") return { success: false, message: "Tiket tidak aktif atau tidak ditemukan." };
  const eventDate = todayKey();
  const validDates = order.productSnapshot.validDates || [];
  if (!validDates.includes(eventDate)) return { success: false, message: "Tiket tidak berlaku pada tanggal ini.", ticket, order };
  const previous = ticket.checkIns.find((item) => item.eventDate === eventDate);
  if (previous) return { success: false, message: "Tiket sudah digunakan hari ini.", ticket, order, previous };
  return { success: true, message: "Tiket valid dan belum digunakan hari ini.", ticket, order, eventDate };
}

export function confirmCheckIn(checkinToken) {
  const validation = validateCheckInToken(checkinToken);
  if (!validation.success) return validation;
  const database = getDatabase();
  const order = database.orders.find((item) => item.tickets.some((ticket) => ticket.checkinToken === checkinToken));
  const ticket = order.tickets.find((item) => item.checkinToken === checkinToken);
  const eventDate = validation.eventDate;
  ticket.checkIns.push({ eventDate, at: new Date().toISOString(), gate: "Belum dikonfigurasi", operator: "Authorized staff" });
  database.auditLogs.unshift({ at: new Date().toISOString(), action: "TICKET_CHECKED_IN", entityId: ticket.id });
  saveDatabase(database);
  return { success: true, message: "Tiket valid. Check-in berhasil.", ticket };
}

export function normalizePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (digits.startsWith("08")) return `+62${digits.slice(1)}`;
  if (digits.startsWith("628")) return `+${digits}`;
  if (digits.startsWith("8")) return `+62${digits}`;
  return input.trim();
}

export function resetDemoDatabase() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("see26:database"));
}
