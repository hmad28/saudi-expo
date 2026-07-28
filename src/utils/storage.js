// Storage utility for Saudi Education Expo 2026 Ticketing System
// Persistent local storage manager with full mock database seeding

const STORAGE_KEY = "SEE26_EVENT_DATABASE_V1";

const initialData = {
  event: {
    id: "evt_see26",
    name: "Saudi Education Expo 2026",
    slug: "saudi-education-expo-2026",
    tagline: "Festival Pendidikan & Beasiswa Arab Saudi Terbesar di Indonesia",
    dates: "31 Juli – 2 Agustus 2026",
    hours: "09.00 – 18.00 WIB",
    venue: "SMESCO Exhibition & Convention Hall",
    address: "Jl. Gatot Subroto Kav. 94, Pancoran, Jakarta Selatan",
    status: "PUBLISHED",
  },

  ticketTypes: [
    {
      id: "tt_student",
      name: "Student Pass",
      note: "Khusus Pelajar & Mahasiswa Aktif",
      price: 85000,
      oldPrice: 120000,
      quota: 1500,
      sold: 930,
      maxPerOrder: 5,
      status: "AVAILABLE",
      perks: [
        "Akses penuh 3 hari Expo",
        "Akses seluruh Seminar & Talkshow Utama",
        "Sertifikat Digital Kehadiran",
        "Panduan Beasiswa Study in Saudi PDF",
      ],
    },
    {
      id: "tt_early",
      name: "Early Access Pass",
      note: "Paket Terfavorit & Paling Lengkap",
      price: 145000,
      oldPrice: 195000,
      quota: 1000,
      sold: 845,
      maxPerOrder: 5,
      featured: true,
      status: "LIMITED",
      perks: [
        "Semua benefit Student Pass",
        "Priority Front-Row Seating di Seminar",
        "1-on-1 Consultation Slot dengan Alumni",
        "Akses Eksklusif Networking Lounge",
        "E-Book Panduan CV & Dokumen Aplikasi",
      ],
    },
    {
      id: "tt_regular",
      name: "Regular Pass",
      note: "Untuk Umum & Profesional",
      price: 120000,
      oldPrice: 160000,
      quota: 2000,
      sold: 1120,
      maxPerOrder: 5,
      status: "AVAILABLE",
      perks: [
        "Akses penuh 3 hari Expo",
        "Akses Seminar & Stage Utama",
        "Panduan Beasiswa Study in Saudi",
        "Digital Event Kit",
      ],
    },
    {
      id: "tt_vip",
      name: "VIP Executive Pass",
      note: "Akses Utama & Fast Track",
      price: 275000,
      oldPrice: 350000,
      quota: 300,
      sold: 210,
      maxPerOrder: 4,
      status: "LIMITED",
      perks: [
        "Fast-track Check-in Lane",
        "VIP Lounge & Catering Access",
        "Direct Q&A Session dengan Perwakilan Kampus",
        "Printed Official Saudi Edu Guide",
        "Reserved Parking Pass",
      ],
    },
    {
      id: "tt_family",
      name: "Family Bundle (2 Dewasa + 2 Anak)",
      note: "Paket Hemat Orang Tua & Anak",
      price: 320000,
      oldPrice: 400000,
      quota: 200,
      sold: 160,
      maxPerOrder: 2,
      status: "LIMITED",
      perks: [
        "Akses 3 Hari untuk 4 Anggota Keluarga",
        "Akses Sesi Konsultasi Orang Tua & Anak",
        "Family Registration Lane",
        "Voucher Merchandising Rp 50.000",
      ],
    },
  ],

  orders: [
    {
      id: "ord_101",
      orderNumber: "SE26-8F4K2P",
      buyerName: "Muhammad Farhan",
      buyerEmail: "farhan.m@gmail.com",
      buyerPhone: "081298765432",
      buyerCity: "Jakarta Selatan",
      buyerInstitution: "UIN Syarif Hidayatullah",
      buyerCategory: "Mahasiswa",
      ticketTypeId: "tt_early",
      ticketTypeName: "Early Access Pass",
      ticketCount: 2,
      unitPrice: 145000,
      subtotal: 290000,
      adminFee: 5000,
      discountAmount: 0,
      totalAmount: 295000,
      paymentMethod: "QRIS",
      status: "PAID",
      paidAt: "2026-07-28T09:14:00+07:00",
      createdAt: "2026-07-28T09:10:00+07:00",
      accessToken: "tk_access_8F4K2P_demo",
    },
    {
      id: "ord_102",
      orderNumber: "SE26-3M9X1L",
      buyerName: "Siti Rahmawati",
      buyerEmail: "siti.rahma@yahoo.com",
      buyerPhone: "085712345678",
      buyerCity: "Bandung",
      buyerInstitution: "MAN 1 Bandung",
      buyerCategory: "Pelajar SMA/MA",
      ticketTypeId: "tt_student",
      ticketTypeName: "Student Pass",
      ticketCount: 1,
      unitPrice: 85000,
      subtotal: 85000,
      adminFee: 5000,
      discountAmount: 8500,
      totalAmount: 81500,
      paymentMethod: "Virtual Account BCA",
      status: "PAID",
      paidAt: "2026-07-28T10:30:00+07:00",
      createdAt: "2026-07-28T10:25:00+07:00",
      accessToken: "tk_access_3M9X1L_demo",
    },
    {
      id: "ord_103",
      orderNumber: "SE26-7P2W9Q",
      buyerName: "Ahmad Fauzi",
      buyerEmail: "a.fauzi@pesantren.org",
      buyerPhone: "081377889900",
      buyerCity: "Surabaya",
      buyerInstitution: "Pondok Pesantren Gontor",
      buyerCategory: "Santri",
      ticketTypeId: "tt_vip",
      ticketTypeName: "VIP Executive Pass",
      ticketCount: 1,
      unitPrice: 275000,
      subtotal: 275000,
      adminFee: 5000,
      discountAmount: 0,
      totalAmount: 280000,
      paymentMethod: "GoPay",
      status: "PENDING_PAYMENT",
      paidAt: null,
      createdAt: "2026-07-28T11:45:00+07:00",
      accessToken: "tk_access_7P2W9Q_demo",
    },
  ],

  attendees: [
    {
      id: "att_201",
      orderId: "ord_101",
      orderNumber: "SE26-8F4K2P",
      ticketCode: "SAEX-EAR-8F4K2P-1",
      name: "Muhammad Farhan",
      email: "farhan.m@gmail.com",
      phone: "081298765432",
      institution: "UIN Syarif Hidayatullah",
      ticketTypeName: "Early Access Pass",
      checkinToken: "chk_token_8F4K2P_1",
      accessToken: "tk_access_8F4K2P_demo",
      status: "ACTIVE",
      checkinStatus: "CHECKED_IN",
      checkedInAt: "2026-07-31T09:15:00+07:00",
      checkedInBy: "Admin Gate 1 (Budi)",
    },
    {
      id: "att_202",
      orderId: "ord_101",
      orderNumber: "SE26-8F4K2P",
      ticketCode: "SAEX-EAR-8F4K2P-2",
      name: "Ahmad Zaki",
      email: "zaki.ahmad@gmail.com",
      phone: "081298765433",
      institution: "UIN Syarif Hidayatullah",
      ticketTypeName: "Early Access Pass",
      checkinToken: "chk_token_8F4K2P_2",
      accessToken: "tk_access_8F4K2P_demo",
      status: "ACTIVE",
      checkinStatus: "UNCHECKED",
      checkedInAt: null,
      checkedInBy: null,
    },
    {
      id: "att_203",
      orderId: "ord_102",
      orderNumber: "SE26-3M9X1L",
      ticketCode: "SAEX-STU-3M9X1L-1",
      name: "Siti Rahmawati",
      email: "siti.rahma@yahoo.com",
      phone: "085712345678",
      institution: "MAN 1 Bandung",
      ticketTypeName: "Student Pass",
      checkinToken: "chk_token_3M9X1L_1",
      accessToken: "tk_access_3M9X1L_demo",
      status: "ACTIVE",
      checkinStatus: "UNCHECKED",
      checkedInAt: null,
      checkedInBy: null,
    },
    {
      id: "att_204",
      orderId: "ord_103",
      orderNumber: "SE26-7P2W9Q",
      ticketCode: "SAEX-VIP-7P2W9Q-1",
      name: "Ahmad Fauzi",
      email: "a.fauzi@pesantren.org",
      phone: "081377889900",
      institution: "Pondok Pesantren Gontor",
      ticketTypeName: "VIP Executive Pass",
      checkinToken: "chk_token_7P2W9Q_1",
      accessToken: "tk_access_7P2W9Q_demo",
      status: "INACTIVE",
      checkinStatus: "UNCHECKED",
      checkedInAt: null,
      checkedInBy: null,
    },
  ],

  payments: [
    {
      id: "pay_301",
      orderId: "ord_101",
      orderNumber: "SE26-8F4K2P",
      provider: "Midtrans Payment Gateway",
      gatewayTransactionId: "TRX-QRIS-9920182",
      paymentMethod: "QRIS",
      amount: 295000,
      status: "SUCCESS",
      webhookStatus: "VERIFIED_IDEMPOTENT",
      paidAt: "2026-07-28T09:14:00+07:00",
    },
    {
      id: "pay_302",
      orderId: "ord_102",
      orderNumber: "SE26-3M9X1L",
      provider: "Xendit Payment Gateway",
      gatewayTransactionId: "TRX-VA-BCA-4491203",
      paymentMethod: "Virtual Account BCA",
      amount: 81500,
      status: "SUCCESS",
      webhookStatus: "VERIFIED_IDEMPOTENT",
      paidAt: "2026-07-28T10:30:00+07:00",
    },
  ],

  emailLogs: [
    {
      id: "eml_401",
      orderNumber: "SE26-8F4K2P",
      recipient: "farhan.m@gmail.com",
      template: "TICKET_PAYMENT_SUCCESS",
      providerMessageId: "msg_resend_9920192a",
      status: "DELIVERED",
      sentAt: "2026-07-28T09:14:05+07:00",
    },
    {
      id: "eml_402",
      orderNumber: "SE26-3M9X1L",
      recipient: "siti.rahma@yahoo.com",
      template: "TICKET_PAYMENT_SUCCESS",
      providerMessageId: "msg_resend_8810291b",
      status: "DELIVERED",
      sentAt: "2026-07-28T10:30:04+07:00",
    },
  ],

  auditLogs: [
    {
      id: "aud_501",
      adminName: "System Webhook",
      action: "ORDER_PAID_AUTOMATION",
      entityType: "ORDER",
      entityId: "ord_101",
      details: "Payment confirmed via QRIS webhook signature verification. 2 Tickets issued automatically.",
      timestamp: "2026-07-28T09:14:00+07:00",
    },
    {
      id: "aud_502",
      adminName: "Budi (Gate 1)",
      action: "TICKET_CHECKIN_CONFIRM",
      entityType: "ATTENDEE",
      entityId: "att_201",
      details: "Participant Muhammad Farhan checked in at Gate 1 via QR Scanner.",
      timestamp: "2026-07-31T09:15:00+07:00",
    },
  ],
};

export function getStoredDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load local database:", err);
    return initialData;
  }
}

export function saveDatabase(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save database:", err);
  }
}

export function resetDatabaseToDefault() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
}

// Order Creation Flow (Serverless Order Validation & Webhook Simulation)
export function createOrder({ buyerData, ticketType, ticketCount, attendeesData, paymentMethod, discountCode }) {
  const db = getStoredDatabase();

  // Validate price & quota from serverless database snapshot
  const targetTicket = db.ticketTypes.find((t) => t.id === ticketType.id);
  if (!targetTicket) throw new Error("Jenis tiket tidak ditemukan");

  const remainingQuota = targetTicket.quota - targetTicket.sold;
  if (remainingQuota < ticketCount) throw new Error("Kuota tiket tidak mencukupi");

  // Calculate pricing server-side
  const unitPrice = targetTicket.price;
  const subtotal = unitPrice * ticketCount;
  const adminFee = 5000;
  let discountAmount = 0;

  if (discountCode && discountCode.toUpperCase() === "SAUDI2026") {
    discountAmount = Math.round(subtotal * 0.1); // 10% discount
  }

  const totalAmount = subtotal + adminFee - discountAmount;

  // Generate clean non-sequential Order Number e.g. SE26-8X9L2Q
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const orderNumber = `SE26-${randomCode}`;
  const orderId = `ord_${Date.now()}`;
  const accessToken = `tk_access_${randomCode}`;

  const now = new Date().toISOString();

  const newOrder = {
    id: orderId,
    orderNumber,
    buyerName: buyerData.fullName,
    buyerEmail: buyerData.email,
    buyerPhone: buyerData.phone,
    buyerCity: buyerData.city,
    buyerInstitution: buyerData.institution,
    buyerCategory: buyerData.category,
    ticketTypeId: targetTicket.id,
    ticketTypeName: targetTicket.name,
    ticketCount,
    unitPrice,
    subtotal,
    adminFee,
    discountAmount,
    totalAmount,
    paymentMethod,
    status: "PAID", // Immediate Webhook Payment Confirmation Simulation
    paidAt: now,
    createdAt: now,
    accessToken,
  };

  // Generate Attendees & Digital Tickets with Secure Tokens
  const newAttendees = [];
  for (let i = 0; i < ticketCount; i++) {
    const attInput = attendeesData[i] || {};
    const attName = attInput.fullName || (i === 0 ? buyerData.fullName : `Peserta ${i + 1}`);
    const attEmail = attInput.email || buyerData.email;
    const attPhone = attInput.phone || buyerData.phone;
    const attInst = attInput.institution || buyerData.institution;
    const checkinToken = `chk_${randomCode}_${i + 1}_${Math.random().toString(36).substring(2, 6)}`;
    const ticketCode = `SAEX-${targetTicket.name.substring(0, 3).toUpperCase()}-${randomCode}-${i + 1}`;

    const attendee = {
      id: `att_${Date.now()}_${i}`,
      orderId: orderId,
      orderNumber: orderNumber,
      ticketCode,
      name: attName,
      email: attEmail,
      phone: attPhone,
      institution: attInst,
      ticketTypeName: targetTicket.name,
      checkinToken,
      accessToken,
      status: "ACTIVE",
      checkinStatus: "UNCHECKED",
      checkedInAt: null,
      checkedInBy: null,
    };
    newAttendees.push(attendee);
  }

  // Record Payment
  const newPayment = {
    id: `pay_${Date.now()}`,
    orderId: orderId,
    orderNumber: orderNumber,
    provider: "Midtrans Serverless Webhook",
    gatewayTransactionId: `TRX-${paymentMethod.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
    paymentMethod,
    amount: totalAmount,
    status: "SUCCESS",
    webhookStatus: "VERIFIED_IDEMPOTENT",
    paidAt: now,
  };

  // Record Email Log
  const newEmail = {
    id: `eml_${Date.now()}`,
    orderNumber: orderNumber,
    recipient: buyerData.email,
    template: "TICKET_PAYMENT_SUCCESS",
    providerMessageId: `msg_see26_${Date.now()}`,
    status: "DELIVERED",
    sentAt: now,
  };

  // Record Audit Log
  const newAudit = {
    id: `aud_${Date.now()}`,
    adminName: "Payment Gateway Webhook",
    action: "ORDER_CREATED_AND_PAID",
    entityType: "ORDER",
    entityId: orderId,
    details: `Order ${orderNumber} (${ticketCount}x ${targetTicket.name}) successfully processed via ${paymentMethod}.`,
    timestamp: now,
  };

  // Update Quota in database
  targetTicket.sold += ticketCount;

  db.orders.unshift(newOrder);
  db.attendees.unshift(...newAttendees);
  db.payments.unshift(newPayment);
  db.emailLogs.unshift(newEmail);
  db.auditLogs.unshift(newAudit);

  saveDatabase(db);

  return {
    order: newOrder,
    attendees: newAttendees,
    accessToken,
  };
}

// Perform Check-in action for QR Code / Manual Code lookup
export function confirmCheckIn(ticketCodeOrToken, adminName = "Admin Scanner Gate 1", gate = "Gate Main") {
  const db = getStoredDatabase();
  const attendee = db.attendees.find(
    (a) => a.ticketCode === ticketCodeOrToken || a.checkinToken === ticketCodeOrToken
  );

  if (!attendee) {
    return { success: false, code: "NOT_FOUND", message: "Tiket tidak ditemukan di sistem." };
  }

  const parentOrder = db.orders.find((o) => o.id === attendee.orderId);
  if (!parentOrder || parentOrder.status !== "PAID") {
    return { success: false, code: "UNPAID", message: "Tiket belum aktif / Pembayaran belum selesai.", attendee };
  }

  if (attendee.status === "CANCELLED" || parentOrder.status === "CANCELLED") {
    return { success: false, code: "CANCELLED", message: "Tiket telah dibatalkan.", attendee };
  }

  if (attendee.checkinStatus === "CHECKED_IN") {
    return {
      success: false,
      code: "ALREADY_CHECKED_IN",
      message: "Tiket sudah digunakan sebelumnya.",
      attendee,
      checkedInAt: attendee.checkedInAt,
      checkedInBy: attendee.checkedInBy,
    };
  }

  // Update Check-in Status
  const now = new Date().toISOString();
  attendee.checkinStatus = "CHECKED_IN";
  attendee.checkedInAt = now;
  attendee.checkedInBy = `${adminName} (${gate})`;

  // Audit Log
  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    adminName,
    action: "TICKET_CHECKIN_CONFIRM",
    entityType: "ATTENDEE",
    entityId: attendee.id,
    details: `Participant ${attendee.name} (${attendee.ticketCode}) checked in at ${gate}.`,
    timestamp: now,
  });

  saveDatabase(db);

  return {
    success: true,
    code: "VALID",
    message: "Check-in berhasil! Tiket divalidasi.",
    attendee,
    checkedInAt: now,
  };
}
