import React, { useState } from "react";
import { getStoredDatabase } from "../utils/storage";
import { QrCode } from "../utils/qr";

export function TicketPassModal({ accessToken, onClose }) {
  const db = getStoredDatabase();
  const matchedOrder = db.orders.find((o) => o.accessToken === accessToken);
  const matchedAttendees = db.attendees.filter((a) => a.accessToken === accessToken);

  const [activeAttIndex, setActiveAttIndex] = useState(0);
  const [copiedText, setCopiedText] = useState("");
  const [emailAlert, setEmailAlert] = useState("");

  if (!matchedOrder || matchedAttendees.length === 0) {
    return (
      <div className="modal-backdrop" onMouseDown={onClose}>
        <div className="ticket-pass-modal" onMouseDown={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          <h2>Tiket Tidak Ditemukan</h2>
          <p>Token akses tiket tidak valid atau telah kadaluwarsa.</p>
        </div>
      </div>
    );
  }

  const currentAttendee = matchedAttendees[activeAttIndex] || matchedAttendees[0];
  const isCheckedIn = currentAttendee.checkinStatus === "CHECKED_IN";

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(currentAttendee.ticketCode);
    setCopiedText("Kode Tiket Disalin!");
    setTimeout(() => setCopiedText(""), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResendEmail = () => {
    setEmailAlert(`Simulasi: Tiket digital telah dikirim ulang ke ${matchedOrder.buyerEmail}!`);
    setTimeout(() => setEmailAlert(""), 4000);
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="ticket-pass-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup pass">
          ×
        </button>

        {/* Multi-ticket Tab Selector if quantity > 1 */}
        {matchedAttendees.length > 1 && (
          <div className="ticket-carousel-tabs">
            {matchedAttendees.map((att, idx) => (
              <button
                key={att.id}
                className={`pass-tab ${activeAttIndex === idx ? "active" : ""}`}
                onClick={() => setActiveAttIndex(idx)}
              >
                Tiket #{idx + 1}: {att.name}
              </button>
            ))}
          </div>
        )}

        {emailAlert && <div className="pass-toast-alert">{emailAlert}</div>}

        {/* LUXURY DIGITAL TICKET PASS CARD */}
        <div className="digital-pass-card">
          <div className="pass-notch left" />
          <div className="pass-notch right" />

          <div className="pass-header">
            <div className="pass-brand">
              <span className="brand-badge">SEE26</span>
              <div className="brand-text">
                <strong>SAUDI EDUCATION EXPO 2026</strong>
                <small>DIGITAL ENTRY PASS · SMESCO JAKARTA</small>
              </div>
            </div>
            <div className={`pass-status-pill ${isCheckedIn ? "checked-in" : "active"}`}>
              {isCheckedIn ? "✓ CHECKED-IN" : "🟢 ACTIVE PASS"}
            </div>
          </div>

          <div className="pass-body">
            <div className="pass-attendee-info">
              <span className="pass-label">NAMA PESERTA</span>
              <h2 className="attendee-name">{currentAttendee.name}</h2>
              <p className="attendee-inst">🏫 {currentAttendee.institution || "Peserta Umum"}</p>
              <div className="category-badge">{currentAttendee.ticketTypeName}</div>
            </div>

            {/* QR CODE CONTAINER */}
            <div className="pass-qr-container">
              <QrCode
                value={`https://see26.id/check-in/${currentAttendee.checkinToken}`}
                size={160}
                fgColor="#082A20"
                bgColor="#FCFAF5"
              />
              <small className="qr-caption">SCAN AT CHECK-IN GATE</small>
            </div>
          </div>

          <div className="pass-details-grid">
            <div>
              <small>KODE TIKET UNIK</small>
              <b onClick={handleCopyCode} style={{ cursor: "pointer" }}>
                {currentAttendee.ticketCode} 📋
              </b>
            </div>
            <div>
              <small>NOMOR BOOKING ORDER</small>
              <b>{matchedOrder.orderNumber}</b>
            </div>
            <div>
              <small>TANGGAL & WAKTU</small>
              <b>31 Jul – 02 Agu 2026 (09:00 WIB)</b>
            </div>
            <div>
              <small>LOKASI VENUE</small>
              <b>SMESCO Exhibition Hall, Jakarta</b>
            </div>
          </div>

          {copiedText && <div className="copy-toast">{copiedText}</div>}

          {isCheckedIn && (
            <div className="checkin-stamp-banner">
              ✓ Telah Check-in pada: {new Date(currentAttendee.checkedInAt).toLocaleString("id-ID")} ({currentAttendee.checkedInBy})
            </div>
          )}

          <div className="pass-footer-notes">
            <small>🔒 Secure Cryptographic Token Hash · Non-transferable Pass · SEE26 Official</small>
          </div>
        </div>

        {/* PASS ACTION BUTTONS */}
        <div className="pass-action-bar">
          <button className="button outline" onClick={handlePrint}>
            🖨️ Print Tiket
          </button>
          <button className="button outline" onClick={handleResendEmail}>
            📧 Kirim Ulang Email
          </button>
          <button className="button primary" onClick={handleCopyCode}>
            📋 Salin Kode Booking
          </button>
        </div>
      </div>
    </div>
  );
}
