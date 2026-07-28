import React, { useState } from "react";
import { getStoredDatabase, saveDatabase, confirmCheckIn, resetDatabaseToDefault } from "../utils/storage";

export function AdminDashboard({ onClose, onOpenPass }) {
  const [db, setDb] = useState(getStoredDatabase());
  const [activeTab, setActiveTab] = useState("overview");

  // Admin Session & Gate Selection
  const [adminRole, setAdminRole] = useState("SUPER_ADMIN"); // SUPER_ADMIN or GATE_CHECKIN
  const [gateName, setGateName] = useState("Gate 1 - Main Entrance");
  const [searchTerm, setSearchTerm] = useState("");

  // Check-in Scanner State
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Edit Attendee Modal State
  const [editingAttendee, setEditingAttendee] = useState(null);
  const [editNameInput, setEditNameInput] = useState("");
  const [editReasonInput, setEditReasonInput] = useState("");

  const reloadDb = () => {
    const updated = getStoredDatabase();
    setDb(updated);
  };

  // KPI Calculations
  const totalRevenue = db.orders
    .filter((o) => o.status === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrders = db.orders.length;
  const paidOrders = db.orders.filter((o) => o.status === "PAID").length;
  const totalTicketsSold = db.ticketTypes.reduce((sum, t) => sum + t.sold, 0);
  const totalActiveTickets = db.attendees.filter((a) => a.status === "ACTIVE").length;
  const totalCheckedIn = db.attendees.filter((a) => a.checkinStatus === "CHECKED_IN").length;
  const checkInRate = totalActiveTickets ? Math.round((totalCheckedIn / totalActiveTickets) * 100) : 0;

  // Scanner Actions
  const handleValidateCode = (codeToScan) => {
    const targetCode = codeToScan || scanInput;
    if (!targetCode.trim()) return;

    const matchedAtt = db.attendees.find(
      (a) => a.ticketCode === targetCode.trim() || a.checkinToken === targetCode.trim()
    );

    if (!matchedAtt) {
      setScanResult({
        status: "NOT_FOUND",
        message: "❌ QR / Kode Tiket tidak ditemukan di database.",
        attendee: null,
      });
      return;
    }

    const parentOrder = db.orders.find((o) => o.id === matchedAtt.orderId);

    if (parentOrder && parentOrder.status !== "PAID") {
      setScanResult({
        status: "UNPAID",
        message: "⚠️ Tiket belum aktif (Pembayaran belum berhasil).",
        attendee: matchedAtt,
      });
      return;
    }

    if (matchedAtt.status === "CANCELLED") {
      setScanResult({
        status: "CANCELLED",
        message: "⛔ Tiket ini telah dibatalkan.",
        attendee: matchedAtt,
      });
      return;
    }

    if (matchedAtt.checkinStatus === "CHECKED_IN") {
      setScanResult({
        status: "ALREADY_CHECKED_IN",
        message: "⚠️ TIKET SUDAH DIGUNAKAN SEBELUMNYA!",
        attendee: matchedAtt,
        checkedInAt: matchedAtt.checkedInAt,
        checkedInBy: matchedAtt.checkedInBy,
      });
      return;
    }

    setScanResult({
      status: "VALID",
      message: "🟢 TIKET VALID & AKTIF",
      attendee: matchedAtt,
    });
  };

  const handleConfirmCheckin = () => {
    if (!scanResult || !scanResult.attendee) return;

    const res = confirmCheckIn(scanResult.attendee.ticketCode, `Admin (${adminRole})`, gateName);
    reloadDb();

    if (res.success) {
      setScanResult({
        status: "CHECKIN_SUCCESS",
        message: `✅ Check-in Berhasil untuk ${res.attendee.name}!`,
        attendee: res.attendee,
        checkedInAt: res.checkedInAt,
      });
    } else {
      setScanResult({
        status: res.code,
        message: res.message,
        attendee: res.attendee,
      });
    }
  };

  // Edit Attendee Name Action
  const handleSaveAttendeeEdit = (e) => {
    e.preventDefault();
    if (!editingAttendee || !editNameInput.trim()) return;

    const updatedDb = { ...db };
    const att = updatedDb.attendees.find((a) => a.id === editingAttendee.id);
    if (att) {
      const oldVal = att.name;
      att.name = editNameInput.trim();

      updatedDb.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        adminName: `Admin (${adminRole})`,
        action: "ATTENDEE_NAME_CORRECTION",
        entityType: "ATTENDEE",
        entityId: att.id,
        details: `Updated name from "${oldVal}" to "${att.name}". Reason: ${editReasonInput || "Typo correction"}`,
        timestamp: new Date().toISOString(),
      });

      saveDatabase(updatedDb);
      reloadDb();
      setEditingAttendee(null);
    }
  };

  // Export CSV Helper
  const exportToCsv = (type) => {
    let rows = [];
    let filename = `SEE26_${type}_export_${Date.now()}.csv`;

    if (type === "orders") {
      rows.push(["Order Number", "Buyer Name", "Email", "Phone", "Ticket Type", "Count", "Total Amount", "Status", "Date"]);
      db.orders.forEach((o) => {
        rows.push([o.orderNumber, o.buyerName, o.buyerEmail, o.buyerPhone, o.ticketTypeName, o.ticketCount, o.totalAmount, o.status, o.createdAt]);
      });
    } else if (type === "attendees") {
      rows.push(["Ticket Code", "Name", "Email", "Institution", "Ticket Type", "Status", "Check-in Status", "Checked In At"]);
      db.attendees.forEach((a) => {
        rows.push([a.ticketCode, a.name, a.email, a.institution, a.ticketTypeName, a.status, a.checkinStatus, a.checkedInAt || "-"]);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-shell">
      {/* Top Navbar */}
      <header className="admin-header">
        <div className="admin-header-brand">
          <span className="logo-mark">SEE<span>26</span></span>
          <div>
            <strong>DASHBOARD INTERNAL PANITIA SEE26</strong>
            <small>Serverless Real-time Admin & Check-in Control</small>
          </div>
        </div>

        <div className="admin-header-controls">
          <select value={adminRole} onChange={(e) => setAdminRole(e.target.value)}>
            <option value="SUPER_ADMIN">👑 Role: Super Admin (Akses Penuh)</option>
            <option value="GATE_CHECKIN">📱 Role: Petugas Gate Check-in</option>
          </select>

          <select value={gateName} onChange={(e) => setGateName(e.target.value)}>
            <option value="Gate 1 - Main Entrance">Gate 1 - Main Entrance</option>
            <option value="Gate 2">Gate 2</option>
            <option value="Gate 3 - Seminar Hall">Gate 3 - Seminar Hall</option>
          </select>

          <button className="button outline small-btn" onClick={() => { saveDatabase(resetDatabaseToDefault()); reloadDb(); }}>
            🔄 Reset Database
          </button>

          <button className="button primary small-btn" onClick={onClose}>
            ← Kembali ke Website
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="admin-body">
        {/* Sidebar Navigation */}
        <aside className="admin-sidebar">
          <button className={`side-nav ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            📊 Overview & Metrics
          </button>
          {adminRole === "SUPER_ADMIN" && (
            <>
              <button className={`side-nav ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")}>
                📦 Data Pesanan ({db.orders.length})
              </button>
              <button className={`side-nav ${activeTab === "attendees" ? "active" : ""}`} onClick={() => setActiveTab("attendees")}>
                👥 Data Peserta ({db.attendees.length})
              </button>
              <button className={`side-nav ${activeTab === "ticket-config" ? "active" : ""}`} onClick={() => setActiveTab("ticket-config")}>
                🎟️ Manajemen Tiket
              </button>
              <button className={`side-nav ${activeTab === "payments" ? "active" : ""}`} onClick={() => setActiveTab("payments")}>
                💳 Payment Webhooks
              </button>
            </>
          )}
          <button className={`side-nav scanner-tab ${activeTab === "scanner" ? "active" : ""}`} onClick={() => setActiveTab("scanner")}>
            📷 Scanner & Check-in
          </button>
          {adminRole === "SUPER_ADMIN" && (
            <>
              <button className={`side-nav ${activeTab === "emails" ? "active" : ""}`} onClick={() => setActiveTab("emails")}>
                📧 Log Email ({db.emailLogs.length})
              </button>
              <button className={`side-nav ${activeTab === "audit" ? "active" : ""}`} onClick={() => setActiveTab("audit")}>
                📜 Audit Logs ({db.auditLogs.length})
              </button>
              <button className={`side-nav ${activeTab === "export" ? "active" : ""}`} onClick={() => setActiveTab("export")}>
                📥 Export CSV Data
              </button>
            </>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="admin-content">
          {/* TAB 1: OVERVIEW METRICS */}
          {activeTab === "overview" && (
            <div className="admin-tab-pane">
              <h2>Overview Penjualan & Kehadiran Event</h2>

              <div className="kpi-grid">
                <div className="kpi-card gold">
                  <small>TOTAL PENDAPATAN</small>
                  <strong>Rp {totalRevenue.toLocaleString("id-ID")}</strong>
                  <span>Dari {paidOrders} transaksi sukses</span>
                </div>
                <div className="kpi-card">
                  <small>TOTAL TRANSAKSI ORDER</small>
                  <strong>{totalOrders} Order</strong>
                  <span>{paidOrders} Paid / {totalOrders - paidOrders} Pending</span>
                </div>
                <div className="kpi-card">
                  <small>TIKET TERJUAL</small>
                  <strong>{totalTicketsSold} Tiket</strong>
                  <span>Target kuota belum ditetapkan</span>
                </div>
                <div className="kpi-card emerald">
                  <small>TOTAL CHECK-IN GATE</small>
                  <strong>{totalCheckedIn} Peserta</strong>
                  <span>Rate Kehadiran: {checkInRate}%</span>
                </div>
              </div>

              {/* Ticket Sales Breakdown Table */}
              <div className="admin-card">
                <h3>Rekap Penjualan per Kategori Tiket</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Jenis Tiket</th>
                      <th>Harga Unit</th>
                      <th>Terjual / Kuota</th>
                      <th>Persentase</th>
                      <th>Status Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {db.ticketTypes.map((t) => {
                      const pct = Math.round((t.sold / t.quota) * 100);
                      return (
                        <tr key={t.id}>
                          <td><strong>{t.name}</strong></td>
                          <td>Rp {t.price.toLocaleString("id-ID")}</td>
                          <td>{t.sold} / {t.quota}</td>
                          <td>
                            <div className="progress-bar-wrap">
                              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                              <span>{pct}%</span>
                            </div>
                          </td>
                          <td><span className={`status-badge ${t.status}`}>{t.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === "orders" && (
            <div className="admin-tab-pane">
              <div className="pane-header">
                <h2>Manajemen Transaksi & Pesanan</h2>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Cari nama, email, order #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No. Order</th>
                    <th>Pembeli</th>
                    <th>Email / WA</th>
                    <th>Jenis Tiket</th>
                    <th>Jumlah</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {db.orders
                    .filter((o) =>
                      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      o.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      o.buyerEmail.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((o) => (
                      <tr key={o.id}>
                        <td><code>{o.orderNumber}</code></td>
                        <td><strong>{o.buyerName}</strong><br /><small>{o.buyerInstitution}</small></td>
                        <td>{o.buyerEmail}<br /><small>{o.buyerPhone}</small></td>
                        <td>{o.ticketTypeName}</td>
                        <td>{o.ticketCount} Tiket</td>
                        <td><strong>Rp {o.totalAmount.toLocaleString("id-ID")}</strong></td>
                        <td><span className={`status-badge ${o.status}`}>{o.status}</span></td>
                        <td><small>{new Date(o.createdAt).toLocaleString("id-ID")}</small></td>
                        <td>
                          <button className="small-action-btn" onClick={() => onOpenPass(o.accessToken)}>
                            👁️ Lihat Pass
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: ATTENDEES LIST */}
          {activeTab === "attendees" && (
            <div className="admin-tab-pane">
              <div className="pane-header">
                <h2>Daftar Peserta Event (Attendees)</h2>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Cari peserta / kode tiket..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kode Tiket</th>
                    <th>Nama Peserta</th>
                    <th>Instansi</th>
                    <th>Kategori Tiket</th>
                    <th>Status Tiket</th>
                    <th>Status Check-in</th>
                    <th>Waktu Check-in</th>
                    <th>Aksi Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {db.attendees
                    .filter((a) =>
                      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      a.ticketCode.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((a) => (
                      <tr key={a.id}>
                        <td><code>{a.ticketCode}</code></td>
                        <td><strong>{a.name}</strong><br /><small>{a.email}</small></td>
                        <td>{a.institution}</td>
                        <td>{a.ticketTypeName}</td>
                        <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                        <td>
                          <span className={`status-badge ${a.checkinStatus}`}>
                            {a.checkinStatus === "CHECKED_IN" ? "✓ CHECKED-IN" : "UNCHECKED"}
                          </span>
                        </td>
                        <td><small>{a.checkedInAt ? new Date(a.checkedInAt).toLocaleString("id-ID") : "-"}</small></td>
                        <td>
                          <button
                            className="small-action-btn"
                            onClick={() => {
                              setEditingAttendee(a);
                              setEditNameInput(a.name);
                              setEditReasonInput("");
                            }}
                          >
                            ✏️ Edit Nama
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: TICKET TYPE MANAGEMENT */}
          {activeTab === "ticket-config" && (
            <div className="admin-tab-pane">
              <h2>Manajemen Kategori & Kuota Tiket</h2>
              <div className="ticket-config-grid">
                {db.ticketTypes.map((t) => (
                  <div key={t.id} className="config-ticket-card">
                    <div className="config-header">
                      <h3>{t.name}</h3>
                      <span className={`status-badge ${t.status}`}>{t.status}</span>
                    </div>
                    <p>{t.note}</p>
                    <div className="config-body">
                      <div><small>HARGA CURRENT</small><strong>Rp {t.price.toLocaleString("id-ID")}</strong></div>
                      <div><small>TERJUAL / KUOTA</small><strong>{t.sold} / {t.quota}</strong></div>
                    </div>
                    <button
                      className="button outline small-btn wide"
                      onClick={() => {
                        const newPrice = prompt(`Masukkan harga baru untuk ${t.name}:`, t.price);
                        if (newPrice && !isNaN(newPrice)) {
                          t.price = parseInt(newPrice, 10);
                          saveDatabase(db);
                          reloadDb();
                        }
                      }}
                    >
                      ✏️ Edit Harga Tiket
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENTS & WEBHOOKS */}
          {activeTab === "payments" && (
            <div className="admin-tab-pane">
              <h2>Log Payment Gateway & Webhook Notifications</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Gateway TRX ID</th>
                    <th>No. Order</th>
                    <th>Provider</th>
                    <th>Metode</th>
                    <th>Nominal</th>
                    <th>Status</th>
                    <th>Idempotency Webhook</th>
                    <th>Waktu Bayar</th>
                  </tr>
                </thead>
                <tbody>
                  {db.payments.map((p) => (
                    <tr key={p.id}>
                      <td><code>{p.gatewayTransactionId}</code></td>
                      <td><code>{p.orderNumber}</code></td>
                      <td>{p.provider}</td>
                      <td>{p.paymentMethod}</td>
                      <td><strong>Rp {p.amount.toLocaleString("id-ID")}</strong></td>
                      <td><span className="status-badge SUCCESS">{p.status}</span></td>
                      <td><small>{p.webhookStatus || "VERIFIED"}</small></td>
                      <td><small>{new Date(p.paidAt).toLocaleString("id-ID")}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: QR SCANNER & MANUAL CHECK-IN */}
          {activeTab === "scanner" && (
            <div className="admin-tab-pane scanner-pane">
              <div className="scanner-layout-grid">
                <div className="scanner-control-box">
                  <h2>📱 Terminal Scanner Check-in Gate</h2>
                  <p className="scanner-desc">
                    Mengarahkan kamera atau memasukkan Kode Tiket / Token acak peserta untuk validasi kehadiran.
                  </p>

                  <div className="gate-info-banner">
                    PETUGAS GATE: <strong>{gateName}</strong>
                  </div>

                  {/* Manual Code Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleValidateCode();
                    }}
                    className="manual-code-form"
                  >
                    <label>
                      Scan / Input Kode Tiket (Contoh: <code>SAEX-EAR-8F4K2P-1</code>)
                      <input
                        type="text"
                        placeholder="Tempel / ketik kode tiket..."
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        autoFocus
                      />
                    </label>
                    <button type="submit" className="button primary wide">
                      🔍 Periksa Tiket
                    </button>
                  </form>

                  {/* Quick Test Demo Code Triggers */}
                  <div className="demo-qr-triggers">
                    <small>DEMO TEST TRIGGER KODE TIKET:</small>
                    <div className="trigger-buttons">
                      <button
                        type="button"
                        onClick={() => {
                          setScanInput("SAEX-EAR-8F4K2P-2");
                          handleValidateCode("SAEX-EAR-8F4K2P-2");
                        }}
                      >
                        🟢 Test Tiket Valid (Muhammad Farhan #2)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setScanInput("SAEX-EAR-8F4K2P-1");
                          handleValidateCode("SAEX-EAR-8F4K2P-1");
                        }}
                      >
                        🟠 Test Already Checked-in
                      </button>
                    </div>
                  </div>
                </div>

                {/* Validation Result Display */}
                <div className="scanner-result-box">
                  {!scanResult ? (
                    <div className="result-placeholder">
                      <div className="placeholder-icon">🔍</div>
                      <h3>Menunggu Input Scan QR</h3>
                      <p>Silakan scan QR code dari layar ponsel peserta atau gunakan form input kode.</p>
                    </div>
                  ) : (
                    <div className={`scan-result-card ${scanResult.status}`}>
                      <div className="result-header">
                        <h3>{scanResult.message}</h3>
                      </div>

                      {scanResult.attendee && (
                        <div className="result-attendee-details">
                          <div className="detail-row">
                            <span>Nama Peserta:</span>
                            <strong>{scanResult.attendee.name}</strong>
                          </div>
                          <div className="detail-row">
                            <span>Instansi:</span>
                            <span>{scanResult.attendee.institution}</span>
                          </div>
                          <div className="detail-row">
                            <span>Kategori Tiket:</span>
                            <span className="category-pill">{scanResult.attendee.ticketTypeName}</span>
                          </div>
                          <div className="detail-row">
                            <span>Kode Tiket:</span>
                            <code>{scanResult.attendee.ticketCode}</code>
                          </div>
                          <div className="detail-row">
                            <span>Order Booking:</span>
                            <span>{scanResult.attendee.orderNumber}</span>
                          </div>

                          {scanResult.status === "ALREADY_CHECKED_IN" && (
                            <div className="history-alert">
                              ⚠️ Check-in sebelumnya recorded pada:<br />
                              <strong>{new Date(scanResult.checkedInAt).toLocaleString("id-ID")}</strong> ({scanResult.checkedInBy})
                            </div>
                          )}

                          {scanResult.status === "VALID" && (
                            <button className="button primary wide confirm-btn" onClick={handleConfirmCheckin}>
                              ✓ KONFIRMASI CHECK-IN PESERTA
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: EMAIL LOGS */}
          {activeTab === "emails" && (
            <div className="admin-tab-pane">
              <h2>Log Pengiriman Email Transaksional Tiket</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>No. Order</th>
                    <th>Email Penerima</th>
                    <th>Template Email</th>
                    <th>Provider Msg ID</th>
                    <th>Status Pengiriman</th>
                    <th>Waktu Dikirim</th>
                  </tr>
                </thead>
                <tbody>
                  {db.emailLogs.map((e) => (
                    <tr key={e.id}>
                      <td><code>{e.orderNumber}</code></td>
                      <td>{e.recipient}</td>
                      <td><code>{e.template}</code></td>
                      <td><small>{e.providerMessageId}</small></td>
                      <td><span className="status-badge DELIVERED">{e.status}</span></td>
                      <td><small>{new Date(e.sentAt).toLocaleString("id-ID")}</small></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 8: AUDIT LOGS */}
          {activeTab === "audit" && (
            <div className="admin-tab-pane">
              <h2>Audit Logs Tindakan Operasional Panitia</h2>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Petugas Admin</th>
                    <th>Tindakan / Action</th>
                    <th>Target Entity</th>
                    <th>Rincian Audit Log</th>
                  </tr>
                </thead>
                <tbody>
                  {db.auditLogs.map((a) => (
                    <tr key={a.id}>
                      <td><small>{new Date(a.timestamp).toLocaleString("id-ID")}</small></td>
                      <td><strong>{a.adminName}</strong></td>
                      <td><code>{a.action}</code></td>
                      <td>{a.entityType}</td>
                      <td>{a.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 9: EXPORT DATA */}
          {activeTab === "export" && (
            <div className="admin-tab-pane">
              <h2>Export Data CSV & Rekapitulasi</h2>
              <div className="export-cards-grid">
                <div className="export-card">
                  <h3>Export Data Order & Transaksi</h3>
                  <p>Unduh seluruh daftar pesanan, status pembayaran, nominal, dan identitas pembeli.</p>
                  <button className="button primary" onClick={() => exportToCsv("orders")}>
                    📥 Download CSV Orders
                  </button>
                </div>

                <div className="export-card">
                  <h3>Export Data Peserta & Check-in</h3>
                  <p>Unduh daftar seluruh peserta, instansi, kode tiket, dan riwayat jam check-in gate.</p>
                  <button className="button primary" onClick={() => exportToCsv("attendees")}>
                    📥 Download CSV Attendees
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Attendee Name Modal */}
      {editingAttendee && (
        <div className="modal-backdrop" onMouseDown={() => setEditingAttendee(null)}>
          <div className="ticket-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setEditingAttendee(null)}>×</button>
            <h2>Koreksi Nama Peserta</h2>
            <p>Perubahan nama peserta akan dicatat secara eksplisit di Audit Log.</p>
            <form onSubmit={handleSaveAttendeeEdit}>
              <label>
                Nama Baru Peserta *
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  required
                />
              </label>
              <label>
                Alasan Koreksi (Audit Trail) *
                <input
                  type="text"
                  placeholder="Contoh: Koreksi ejaan nama salah ketik"
                  value={editReasonInput}
                  onChange={(e) => setEditReasonInput(e.target.value)}
                  required
                />
              </label>
              <button type="submit" className="button primary wide">
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
