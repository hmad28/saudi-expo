import React from "react";
import { Icon } from "./Icons";

const ticketMeta = {
  tt_student: { badge: "Pelajar", deadline: "Penjualan sampai 20 Juli 2026" },
  tt_early: { badge: "Paling diminati", deadline: "Early bird sampai 30 Mei 2026" },
  tt_regular: { badge: "Reguler", deadline: "Penjualan sampai 30 Juli 2026" },
  tt_vip: { badge: "Akses premium", deadline: "Kuota terbatas" },
  tt_family: { badge: "Paket keluarga", deadline: "Maksimal 2 paket per pesanan" },
};

export function TicketSection({ ticketTypes = [], onSelectTicket }) {
  return (
    <section className="section-block ticket-section" id="tiket">
      <div className="shell">
        <div className="ticket-header">
          <div>
            <span className="section-label">Tiket SEE26</span>
            <h2>Pilih tiket yang sesuai.</h2>
            <p>Semua tiket berlaku selama tiga hari dan dikirim sebagai digital pass setelah pembayaran terverifikasi.</p>
          </div>
          <div className="ticket-trust"><Icon name="shield" /><span><strong>Pembayaran aman</strong><small>QRIS, VA, e-wallet & kartu</small></span></div>
        </div>

        <div className="ticket-grid">
          {ticketTypes.map((ticket) => {
            const remaining = Math.max(0, ticket.quota - ticket.sold);
            const soldOut = remaining === 0;
            const meta = ticketMeta[ticket.id] || { badge: "Tiket", deadline: "Selama kuota tersedia" };
            const percentage = Math.min(100, Math.round((ticket.sold / ticket.quota) * 100));

            return (
              <article className={`ticket-card ${ticket.featured ? "is-featured" : ""}`} key={ticket.id}>
                <div className="ticket-card-head">
                  <span className="ticket-badge">{meta.badge}</span>
                  <span className={`availability ${soldOut ? "is-soldout" : ""}`}>{soldOut ? "Habis" : "Tersedia"}</span>
                </div>
                <div className="ticket-title">
                  <h3>{ticket.name}</h3>
                  <p>{ticket.note}</p>
                </div>
                <div className="ticket-price">
                  <span>Rp</span>
                  <strong>{ticket.price.toLocaleString("id-ID")}</strong>
                  {ticket.oldPrice && <del>Rp{ticket.oldPrice.toLocaleString("id-ID")}</del>}
                </div>
                <div className="quota-block">
                  <div><span>Sisa {remaining} tiket</span><span>{percentage}% terjual</span></div>
                  <span className="quota-track"><i style={{ width: `${percentage}%` }} /></span>
                </div>
                <ul>
                  {ticket.perks.slice(0, 5).map((perk) => (
                    <li key={perk}><span><Icon name="check" size={15} /></span>{perk}</li>
                  ))}
                </ul>
                <div className="ticket-deadline"><Icon name="calendar" size={17} />{meta.deadline}</div>
                <button
                  className="btn btn-primary btn-full"
                  disabled={soldOut}
                  onClick={() => onSelectTicket(ticket)}
                >
                  {soldOut ? "Tiket Habis" : "Pilih Tiket"}
                  {!soldOut && <Icon name="arrow" size={18} />}
                </button>
              </article>
            );
          })}
        </div>
        <div className="ticket-policy">
          <Icon name="shield" />
          <p>Harga dan biaya layanan ditampilkan sebelum pembayaran. Tiket hanya aktif setelah transaksi terverifikasi.</p>
          <a href="#faq">Lihat kebijakan</a>
        </div>
      </div>
    </section>
  );
}
