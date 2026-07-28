import React from "react";

export function TicketSection({ ticketTypes = [], onSelectTicket }) {
  return (
    <section className="tickets section" id="tiket">
      <div className="wrap">
        <div className="ticket-heading reveal visible">
          <div className="eyebrow">
            <span /> TIKET DIGITASI SANPA AKUN
          </div>
          <h2>
            Pilih jenis aksesmu.<br />
            <em>Mulai perjalanan studimu.</em>
          </h2>
          <p>
            Satu tiket berlaku penuh untuk 3 hari acara. Tanpa registrasi akun. Tiket digital dan QR unik langsung dikirim ke email kamu setelah pembayaran terverifikasi.
          </p>
        </div>

        <div className="ticket-grid">
          {ticketTypes.map((ticket) => {
            const isFeatured = ticket.featured;
            const remaining = ticket.quota - ticket.sold;
            const isSoldOut = remaining <= 0;

            return (
              <article
                className={`ticket-card reveal visible ${isFeatured ? "featured" : ""}`}
                key={ticket.id}
              >
                {isFeatured && <div className="recommend">PAKET PALING DIMINATI</div>}

                <div className="ticket-top">
                  <div>
                    <span className="ticket-name">{ticket.name}</span>
                    <small>{ticket.note}</small>
                  </div>
                  <span className="ticket-dot" />
                </div>

                <div className="price">
                  <small>Rp</small>
                  <strong>{ticket.price.toLocaleString("id-ID")}</strong>
                  {ticket.oldPrice && (
                    <del>Rp {ticket.oldPrice.toLocaleString("id-ID")}</del>
                  )}
                </div>

                <div className="quota">
                  <span />
                  <b>
                    {isSoldOut
                      ? "HABIS (SOLD OUT)"
                      : `KUOTA TERSISA ${remaining} / ${ticket.quota}`}
                  </b>
                </div>

                <ul>
                  {ticket.perks.map((perk) => (
                    <li key={perk}>
                      ✓ <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`button ${isFeatured ? "primary" : "outline"}`}
                  disabled={isSoldOut}
                  onClick={() => onSelectTicket(ticket)}
                >
                  {isSoldOut ? "Kuota Habis" : "Beli Tiket Sekarang"}
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </article>
            );
          })}
        </div>

        <div className="payment-transparency reveal visible">
          <div className="transparency-card">
            <span>🔒 PEMBAYARAN AMAN VIA PAYMENT GATEWAY RESMI</span>
            <p>
              Mendukung QRIS, Virtual Account (BCA, Mandiri, BNI, BRI), E-Wallet (GoPay, OVO, ShopeePay), dan Kartu Kredit. Status tiket diperbarui otomatis via webhook resmi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
