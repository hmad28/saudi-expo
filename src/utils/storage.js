import { EVENT } from "../data/eventConfig";
import { api, uploadFile } from "./api";

const publicToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

export const formatRupiah = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0,
}).format(value);

export const formatDateTime = (value) => new Intl.DateTimeFormat("id-ID", {
  dateStyle: "full", timeStyle: "short", timeZone: EVENT.timezone,
}).format(new Date(value)) + " WIB";

export async function createOrder({ productId, quantity, buyer, attendees, donation = 0, voucherCode = "" }) {
  const requestToken = publicToken();
  const order = await api("/api/orders", {
    method: "POST",
    headers: { "idempotency-key": crypto.randomUUID() },
    body: JSON.stringify({
      productId,
      quantity,
      buyer: { ...buyer, emailConfirmation: undefined },
      attendees,
      donation,
      voucherCode,
      requestToken,
    }),
  });
  return { ...order, publicToken: requestToken };
}

export const getOrderByToken = (token) => api(`/api/orders/${encodeURIComponent(token)}`);
export async function getProducts() {
  const rows = await api("/api/products");
  return rows.map((row) => ({ ...row.metadata, ...row, date: row.dateLabel }));
}
export async function submitPaymentProof(token, { file, claimedAmount, transferredAt }) {
  const uploadIntentToken = await uploadFile("paymentProof", "PAYMENT_PROOF", file, token);
  return api(`/api/orders/${encodeURIComponent(token)}/proof`, {
    method: "POST",
    body: JSON.stringify({ claimedAmount, transferredAt: new Date(transferredAt).toISOString(), uploadIntentToken }),
  });
}
export async function getTicketByToken(token) {
  const ticket = await api(`/api/tickets/${encodeURIComponent(token)}`);
  const order = ticket.order;
  return { order, ticket: { ...ticket, order: undefined } };
}
export const validateCheckInToken = (token) => api(`/api/checkins/${encodeURIComponent(token)}`);
export const confirmCheckIn = (token) => api(`/api/checkins/${encodeURIComponent(token)}`, { method: "POST", body: "{}" });

export const getAdminOverview = () => api("/api/admin/overview");
export const approvePayment = (id) => api(`/api/admin/orders/${id}/review`, { method: "POST", body: JSON.stringify({ decision: "APPROVE" }) });
export const rejectPayment = (id, reason) => api(`/api/admin/orders/${id}/review`, { method: "POST", body: JSON.stringify({ decision: "REJECT", reason }) });
export const updateApplicationStatus = (id, status) => api(`/api/admin/applications/${id}/status`, { method: "POST", body: JSON.stringify({ status }) });
export async function openPrivateFile(key) {
  const { url } = await api(`/api/admin/files/${encodeURIComponent(key)}`);
  window.open(url, "_blank", "noopener,noreferrer");
}
