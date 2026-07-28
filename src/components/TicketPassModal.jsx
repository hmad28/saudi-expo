import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getStoredDatabase } from "../utils/storage";
import { Icon } from "./Icons";

export function TicketPassModal({ accessToken, onClose }) {
  const db = getStoredDatabase();
  const order = db.orders.find((item) => item.accessToken === accessToken);
  const attendees = db.attendees.filter((item) => item.accessToken === accessToken);
  const [activeIndex, setActiveIndex] = useState(0);
  const [toast, setToast] = useState("");

  if (!order || attendees.length === 0) {
    return (
      <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
        <div className="empty-pass-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
          <button className="icon-button modal-close" onClick={onClose} aria-label="Tutup"><Icon name="close" /></button>
          <h2>Tiket tidak ditemukan</h2>
          <p>Link tiket tidak valid atau sudah tidak aktif.</p>
        </div>
      </div>
    );
  }

  const attendee = attendees[activeIndex] || attendees[0];
  const checkedIn = attendee.checkinStatus === "CHECKED_IN";
  const notify = (text) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 2200);
  };
  const copyCode = async () => {
    await navigator.clipboard?.writeText(attendee.ticketCode);
    notify("Kode tiket disalin.");
  };

  return (
    <div className="modal-backdrop pass-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="pass-modal" role="dialog" aria-modal="true" aria-labelledby="pass-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="pass-modal-header">
          <div><small>Digital pass</small><h2 id="pass-title">Tiket Saudi Education Expo</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Tutup digital pass"><Icon name="close" /></button>
        </header>

        {attendees.length > 1 && (
          <div className="pass-tabs" role="tablist" aria-label="Pilih tiket peserta">
            {attendees.map((item, index) => (
              <button key={item.id} role="tab" aria-selected={activeIndex === index} className={activeIndex === index ? "is-active" : ""} onClick={() => setActiveIndex(index)}>
                {index + 1}. {item.name}
              </button>
            ))}
          </div>
        )}

        <article className="wallet-pass">
          <div className="wallet-pass-top">
            <div className="wallet-brand"><span>SEE</span><div><strong>Saudi Education Expo</strong><small>31 Jul–2 Agu 2026</small></div></div>
            <span className={`pass-status ${checkedIn ? "is-used" : ""}`}><i />{checkedIn ? "Sudah check-in" : "Aktif"}</span>
          </div>
          <div className="wallet-person">
            <small>Nama peserta</small>
            <h3>{attendee.name}</h3>
            <span>{attendee.ticketTypeName}</span>
          </div>
          <div className="wallet-qr">
            <div>
              <QRCodeSVG
                value={`https://see26.id/check-in/${attendee.checkinToken}`}
                size={188}
                level="M"
                marginSize={2}
                bgColor="#FFFFFF"
                fgColor="#121613"
                title={`QR check-in untuk ${attendee.name}`}
              />
            </div>
            <p>Tunjukkan QR ini kepada petugas check-in.</p>
          </div>
          <div className="wallet-details">
            <div><small>Tanggal</small><strong>31 Jul–2 Agu 2026</strong></div>
            <div><small>Lokasi</small><strong>SMESCO, Jakarta</strong></div>
            <div><small>Kode tiket</small><button onClick={copyCode}>{attendee.ticketCode}<Icon name="copy" size={15} /></button></div>
            <div><small>Nomor pesanan</small><strong>{order.orderNumber}</strong></div>
          </div>
          {checkedIn && <div className="used-message">Check-in tercatat pada {new Date(attendee.checkedInAt).toLocaleString("id-ID")}.</div>}
        </article>

        <div className="pass-actions">
          <button className="btn btn-secondary" onClick={() => window.print()}><Icon name="print" />Cetak</button>
          <button className="btn btn-secondary" onClick={() => notify(`Tiket dikirim ulang ke ${order.buyerEmail}.`)}><Icon name="mail" />Kirim ulang</button>
          <button className="btn btn-primary" onClick={copyCode}><Icon name="copy" />Salin kode</button>
        </div>
        <div className="pass-help"><Icon name="shield" size={17} />QR tidak menyimpan nama, email, atau nomor WhatsApp.</div>
        {toast && <div className="toast" aria-live="polite">{toast}</div>}
      </section>
    </div>
  );
}
