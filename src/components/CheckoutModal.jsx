import React, { useState } from "react";
import { createOrder } from "../utils/storage";

export function CheckoutModal({ ticket, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [ticketCount, setTicketCount] = useState(1);

  // Buyer Form State
  const [buyerData, setBuyerData] = useState({
    fullName: "",
    email: "",
    confirmEmail: "",
    phone: "",
    city: "",
    institution: "",
    category: "Pelajar SMA/MA",
    agreeTerms: false,
  });

  // Attendees Data State
  const [attendeesData, setAttendeesData] = useState([
    { fullName: "", email: "", phone: "", institution: "" },
  ]);

  // Payment & Discount State
  const [paymentMethod, setPaymentMethod] = useState("QRIS");
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrderResult, setCompletedOrderResult] = useState(null);

  const unitPrice = ticket.price;
  const subtotal = unitPrice * ticketCount;
  const adminFee = 5000;
  const discountAmount = discountApplied ? Math.round(subtotal * 0.1) : 0;
  const totalAmount = subtotal + adminFee - discountAmount;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "SAUDI2026") {
      setDiscountApplied(true);
      setErrorMessage("");
    } else {
      setErrorMessage("Kode promo tidak valid. Gunakan: SAUDI2026");
    }
  };

  const handleBuyerSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!buyerData.fullName.trim()) return setErrorMessage("Nama lengkap wajib diisi.");
    if (!buyerData.email.trim()) return setErrorMessage("Email aktif wajib diisi.");
    if (buyerData.email.trim().toLowerCase() !== buyerData.confirmEmail.trim().toLowerCase()) {
      return setErrorMessage("Konfirmasi email tidak cocok dengan email utama.");
    }
    if (!buyerData.phone.trim()) return setErrorMessage("Nomor WhatsApp wajib diisi.");
    if (!buyerData.city.trim()) return setErrorMessage("Domisili kota wajib diisi.");
    if (!buyerData.institution.trim()) return setErrorMessage("Instansi / Sekolah wajib diisi.");
    if (!buyerData.agreeTerms) return setErrorMessage("Kamu harus menyetujui syarat & ketentuan.");

    // Sync attendee #1 default
    const newAtts = [...attendeesData];
    if (!newAtts[0] || !newAtts[0].fullName) {
      newAtts[0] = {
        fullName: buyerData.fullName,
        email: buyerData.email,
        phone: buyerData.phone,
        institution: buyerData.institution,
      };
    }
    // Adjust array size to match ticketCount
    while (newAtts.length < ticketCount) {
      newAtts.push({ fullName: "", email: "", phone: "", institution: buyerData.institution });
    }
    setAttendeesData(newAtts.slice(0, ticketCount));

    setStep(3);
  };

  const handleAttendeesSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    for (let i = 0; i < ticketCount; i++) {
      if (!attendeesData[i]?.fullName?.trim()) {
        return setErrorMessage(`Nama lengkap Peserta #${i + 1} wajib diisi.`);
      }
    }

    setStep(4);
  };

  const handleExecutePayment = () => {
    setIsProcessing(true);
    setErrorMessage("");

    setTimeout(() => {
      try {
        const result = createOrder({
          buyerData,
          ticketType: ticket,
          ticketCount,
          attendeesData,
          paymentMethod,
          discountCode: discountApplied ? "SAUDI2026" : "",
        });

        setCompletedOrderResult(result);
        setIsProcessing(false);
        setStep(5);
      } catch (err) {
        setIsProcessing(false);
        setErrorMessage(err.message || "Gagal memproses transaksi");
      }
    }, 1500);
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="checkout-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup checkout">
          ×
        </button>

        {/* Stepper Header */}
        <div className="checkout-stepper">
          <div className={`step-item ${step >= 1 ? "active" : ""}`}>
            <span>1</span>
            <small>Pilih Tiket</small>
          </div>
          <div className={`step-item ${step >= 2 ? "active" : ""}`}>
            <span>2</span>
            <small>Data Pembeli</small>
          </div>
          <div className={`step-item ${step >= 3 ? "active" : ""}`}>
            <span>3</span>
            <small>Data Peserta</small>
          </div>
          <div className={`step-item ${step >= 4 ? "active" : ""}`}>
            <span>4</span>
            <small>Pembayaran</small>
          </div>
        </div>

        {errorMessage && <div className="checkout-error">⚠️ {errorMessage}</div>}

        {/* STEP 1: Select Ticket Quantity */}
        {step === 1 && (
          <div className="checkout-step-body">
            <div className="eyebrow">
              <span /> LANGKAH 1 DARI 4
            </div>
            <h2>Ringkasan Tiket Dipilih</h2>
            <p className="checkout-note">
              Kamu memilih kategori <strong>{ticket.name}</strong> ({ticket.note}).
            </p>

            <div className="quantity-selector">
              <label>Jumlah Tiket:</label>
              <div className="qty-controls">
                <button
                  type="button"
                  onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                  disabled={ticketCount <= 1}
                >
                  −
                </button>
                <span>{ticketCount}</span>
                <button
                  type="button"
                  onClick={() => setTicketCount(Math.min(ticket.maxPerOrder || 5, ticketCount + 1))}
                  disabled={ticketCount >= (ticket.maxPerOrder || 5)}
                >
                  +
                </button>
              </div>
              <small>Maksimal {ticket.maxPerOrder || 5} tiket per order</small>
            </div>

            <div className="order-summary-box">
              <div className="summary-row">
                <span>{ticketCount} × {ticket.name}</span>
                <strong>Rp {subtotal.toLocaleString("id-ID")}</strong>
              </div>
              <div className="summary-row">
                <span>Biaya Layanan Admin</span>
                <strong>Rp {adminFee.toLocaleString("id-ID")}</strong>
              </div>
              <div className="summary-row total">
                <span>Estimasi Total</span>
                <strong>Rp {totalAmount.toLocaleString("id-ID")}</strong>
              </div>
            </div>

            <button className="button primary wide" onClick={() => setStep(2)}>
              Lanjut Isi Data Pembeli
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* STEP 2: Buyer Data */}
        {step === 2 && (
          <form className="checkout-step-body" onSubmit={handleBuyerSubmit}>
            <div className="eyebrow">
              <span /> LANGKAH 2 DARI 4
            </div>
            <h2>Identitas Pembeli (Tanpa Akun)</h2>
            <p className="checkout-note warning-text">
              📌 Pastikan email aktif & benar. Tiket digital dan QR Code unik akan dikirimkan ke email ini.
            </p>

            <div className="form-grid">
              <label>
                Nama Lengkap Pembeli *
                <input
                  type="text"
                  placeholder="Contoh: Muhammad Farhan"
                  value={buyerData.fullName}
                  onChange={(e) => setBuyerData({ ...buyerData, fullName: e.target.value })}
                  required
                />
              </label>

              <label>
                Email Aktif *
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={buyerData.email}
                  onChange={(e) => setBuyerData({ ...buyerData, email: e.target.value })}
                  required
                />
              </label>

              <label>
                Konfirmasi Email * (Ketik Ulang Email)
                <input
                  type="email"
                  placeholder="Ketik ulang email untuk verifikasi"
                  value={buyerData.confirmEmail}
                  onChange={(e) => setBuyerData({ ...buyerData, confirmEmail: e.target.value })}
                  required
                />
              </label>

              <label>
                Nomor WhatsApp *
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={buyerData.phone}
                  onChange={(e) => setBuyerData({ ...buyerData, phone: e.target.value })}
                  required
                />
              </label>

              <label>
                Kota Domisili *
                <input
                  type="text"
                  placeholder="Contoh: Jakarta Selatan"
                  value={buyerData.city}
                  onChange={(e) => setBuyerData({ ...buyerData, city: e.target.value })}
                  required
                />
              </label>

              <label>
                Instansi / Sekolah / Kampus *
                <input
                  type="text"
                  placeholder="Contoh: UIN Syarif Hidayatullah / SMA 1"
                  value={buyerData.institution}
                  onChange={(e) => setBuyerData({ ...buyerData, institution: e.target.value })}
                  required
                />
              </label>

              <label className="full-width">
                Kategori Pendaftar
                <select
                  value={buyerData.category}
                  onChange={(e) => setBuyerData({ ...buyerData, category: e.target.value })}
                >
                  <option value="Pelajar SMA/MA">Pelajar SMA/MA</option>
                  <option value="Santri">Santri Pondok Pesantren</option>
                  <option value="Mahasiswa">Mahasiswa S1/S2/S3</option>
                  <option value="Orang Tua / Wali">Orang Tua / Wali</option>
                  <option value="Umum & Profesional">Umum & Profesional</option>
                </select>
              </label>

              <label className="checkbox-label full-width">
                <input
                  type="checkbox"
                  checked={buyerData.agreeTerms}
                  onChange={(e) => setBuyerData({ ...buyerData, agreeTerms: e.target.checked })}
                />
                Saya mengonfirmasi bahwa data di atas sudah benar dan menyetujui syarat & ketentuan SEE26.
              </label>
            </div>

            <div className="btn-group">
              <button type="button" className="button outline" onClick={() => setStep(1)}>
                Kembali
              </button>
              <button type="submit" className="button primary">
                Lanjut Data Peserta
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Attendee Data */}
        {step === 3 && (
          <form className="checkout-step-body" onSubmit={handleAttendeesSubmit}>
            <div className="eyebrow">
              <span /> LANGKAH 3 DARI 4
            </div>
            <h2>Data Peserta Event ({ticketCount} Tiket)</h2>
            <p className="checkout-note">
              Setiap peserta akan menerima QR Code tiket unik yang berbeda untuk check-in di venue.
            </p>

            <div className="attendee-forms-list">
              {attendeesData.map((att, idx) => (
                <div key={idx} className="attendee-card-item">
                  <h4>Peserta #{idx + 1}</h4>
                  <div className="form-grid">
                    <label>
                      Nama Lengkap Peserta *
                      <input
                        type="text"
                        placeholder={`Nama Peserta #${idx + 1}`}
                        value={att.fullName}
                        onChange={(e) => {
                          const updated = [...attendeesData];
                          updated[idx].fullName = e.target.value;
                          setAttendeesData(updated);
                        }}
                        required
                      />
                    </label>

                    <label>
                      Instansi / Sekolah
                      <input
                        type="text"
                        placeholder="Instansi"
                        value={att.institution}
                        onChange={(e) => {
                          const updated = [...attendeesData];
                          updated[idx].institution = e.target.value;
                          setAttendeesData(updated);
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="btn-group">
              <button type="button" className="button outline" onClick={() => setStep(2)}>
                Kembali
              </button>
              <button type="submit" className="button primary">
                Lanjut ke Pembayaran
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: Payment Selection & Summary */}
        {step === 4 && (
          <div className="checkout-step-body">
            <div className="eyebrow">
              <span /> LANGKAH 4 DARI 4
            </div>
            <h2>Metode Pembayaran</h2>

            {/* Promo Code Box */}
            <div className="promo-box">
              <input
                type="text"
                placeholder="Kode Promo (Coba: SAUDI2026)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={discountApplied}
              />
              <button
                type="button"
                className="button outline"
                onClick={handleApplyPromo}
                disabled={discountApplied || !promoCode.trim()}
              >
                {discountApplied ? "Terpasang ✓" : "Gunakan Promo"}
              </button>
            </div>

            {/* Payment Methods */}
            <div className="payment-options">
              {[
                { id: "QRIS", name: "QRIS (GoPay, OVO, ShopeePay, Dana, LinkAja)", icon: "📱" },
                { id: "Virtual Account BCA", name: "Virtual Account BCA", icon: "🏦" },
                { id: "Virtual Account Mandiri", name: "Virtual Account Mandiri", icon: "🏦" },
                { id: "Virtual Account BNI", name: "Virtual Account BNI", icon: "🏦" },
                { id: "Kartu Kredit / Debit", name: "Kartu Kredit / Debit Visa & MasterCard", icon: "💳" },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`payment-option-card ${paymentMethod === method.id ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="pay-icon">{method.icon}</span>
                  <span className="pay-name">{method.name}</span>
                </label>
              ))}
            </div>

            {/* Final Order Breakdown */}
            <div className="order-summary-box">
              <div className="summary-row">
                <span>{ticketCount} × {ticket.name}</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="summary-row">
                <span>Biaya Layanan Admin</span>
                <span>Rp {adminFee.toLocaleString("id-ID")}</span>
              </div>
              {discountApplied && (
                <div className="summary-row discount">
                  <span>Diskon Promo SAUDI2026 (10%)</span>
                  <span>- Rp {discountAmount.toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>TOTAL BAYAR</span>
                <strong>Rp {totalAmount.toLocaleString("id-ID")}</strong>
              </div>
            </div>

            <div className="btn-group">
              <button type="button" className="button outline" onClick={() => setStep(3)} disabled={isProcessing}>
                Kembali
              </button>
              <button
                type="button"
                className="button primary wide"
                onClick={handleExecutePayment}
                disabled={isProcessing}
              >
                {isProcessing ? "Memproses Webhook Gateway..." : "Bayar Sekarang"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Success Confirmation Screen */}
        {step === 5 && completedOrderResult && (
          <div className="checkout-step-body success-body">
            <div className="success-icon-badge">✓</div>
            <div className="eyebrow gold">
              <span /> PEMBAYARAN BERHASIL
            </div>
            <h2>Tiket Digital Diterbitkan!</h2>

            <div className="order-number-banner">
              <small>NOMOR PESANAN KODE BOOKING:</small>
              <strong>{completedOrderResult.order.orderNumber}</strong>
            </div>

            <p className="checkout-note">
              Email konfirmasi beserta QR tiket unik telah dikirim ke <strong>{buyerData.email}</strong>.
            </p>

            <div className="success-actions">
              <button
                className="button primary wide"
                onClick={() => {
                  onClose();
                  onSuccess(completedOrderResult.accessToken);
                }}
              >
                🎟️ Buka Tiket Digital Saya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
