const STORAGE_KEY = "SEE26_EVENT_DATABASE_V2";

const initialData = {
  event: {
    id: "evt_see26",
    name: "Saudi Education Expo 2026",
    previousName: "Saudi University Expo 2025",
    slug: "saudi-education-expo-2026",
    dates: "31 Juli–2 Agustus 2026",
    venue: "SMESCO Indonesia, Jakarta",
    organizer: "Agenda kolaboratif PPMI Saudi dan organisasi wilayah melalui kepanitiaan independen",
    status: "PUBLISHED",
  },
  ticketTypes: [],
  orders: [],
  attendees: [],
  payments: [],
  emailLogs: [],
  auditLogs: [],
};

export function getStoredDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      return structuredClone(initialData);
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load local database:", error);
    return structuredClone(initialData);
  }
}

export function saveDatabase(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save database:", error);
  }
}

export function resetDatabaseToDefault() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return structuredClone(initialData);
}

export function createOrder() {
  throw new Error("Penjualan tiket belum dibuka oleh penyelenggara.");
}

export function confirmCheckIn() {
  return { success: false, code: "NOT_AVAILABLE", message: "Sistem check-in belum diaktifkan." };
}
