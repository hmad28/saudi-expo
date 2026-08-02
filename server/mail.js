import { MailtrapClient } from "mailtrap";

const configured = () => Boolean(process.env.MAILTRAP_API_KEY && process.env.MAILTRAP_INBOX_ID);

export async function sendEmail({ to, subject, text, html }) {
  if (!configured()) return { skipped: true, reason: "MAILTRAP_INBOX_ID is not configured" };
  const client = new MailtrapClient({
    token: process.env.MAILTRAP_API_KEY,
    sandbox: process.env.MAILTRAP_USE_SANDBOX !== "false",
    testInboxId: Number(process.env.MAILTRAP_INBOX_ID),
  });
  return client.send({
    from: {
      name: process.env.MAIL_FROM_NAME || "Saudi Education Expo",
      email: process.env.MAIL_FROM_EMAIL || "sandbox@example.com",
    },
    to: [{ email: to }],
    subject,
    text,
    html,
  });
}

export const orderCreatedEmail = (order, publicToken) => sendEmail({
  to: order.buyerEmail,
  subject: `Pesanan ${order.orderNumber} dibuat`,
  text: `Pesanan ${order.orderNumber} telah dibuat. Total pembayaran: Rp${order.total.toLocaleString("id-ID")}. Buka ${process.env.APP_URL}/payment/${publicToken}`,
  html: `<h1>Pesanan berhasil dibuat</h1><p>Nomor pesanan: <strong>${order.orderNumber}</strong></p><p>Total pembayaran: <strong>Rp${order.total.toLocaleString("id-ID")}</strong></p><p><a href="${process.env.APP_URL}/payment/${publicToken}">Lihat instruksi pembayaran</a></p>`,
});

export const paymentApprovedEmail = (order, ticketLinks) => sendEmail({
  to: order.buyerEmail,
  subject: `Pembayaran ${order.orderNumber} disetujui`,
  text: `Pembayaran telah disetujui. Tiket: ${ticketLinks.join(", ")}`,
  html: `<h1>Pembayaran berhasil</h1><p>Tiket digital sudah diterbitkan.</p><ul>${ticketLinks.map((link, index) => `<li><a href="${link}">Buka tiket ${index + 1}</a></li>`).join("")}</ul>`,
});

export const applicationReceivedEmail = (application, publicToken) => sendEmail({
  to: application.contactEmail,
  subject: `Pengajuan ${application.number} diterima`,
  text: `Pengajuan ${application.number} telah diterima. Pantau status di ${process.env.APP_URL}/${application.type === "INSTITUTION" ? "lembaga" : "kemitraan"}/status/${publicToken}`,
  html: `<h1>Pengajuan diterima</h1><p>Nomor pengajuan: <strong>${application.number}</strong></p><p><a href="${process.env.APP_URL}/${application.type === "INSTITUTION" ? "lembaga" : "kemitraan"}/status/${publicToken}">Pantau status</a></p>`,
});
