import { EVENT, SCHEDULE, TICKETS } from "../data/eventConfig.js";

const eventOffset = EVENT.utcOffset || EVENT.startsAt.slice(-6);

export const getEventDateKey = (now = new Date()) => new Intl.DateTimeFormat("en-CA", {
  timeZone: EVENT.timezone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(now);

const atEventTime = (date, time) => new Date(`${date}T${time}:00${eventOffset}`).getTime();

export function getEventPhase(now = new Date()) {
  const timestamp = now.getTime();
  if (timestamp < new Date(EVENT.startsAt).getTime()) return "UPCOMING";
  if (timestamp <= new Date(EVENT.endsAt).getTime()) return "LIVE";
  return "ENDED";
}

export function getRelevantScheduleDay(now = new Date()) {
  const today = getEventDateKey(now);
  return SCHEDULE.find((item) => item.date === today)
    || SCHEDULE.find((item) => item.date > today)
    || SCHEDULE.at(-1);
}

export const getScheduleHref = (now = new Date()) => {
  const day = getRelevantScheduleDay(now);
  return `/jadwal?day=${day.id.replace("day-", "")}#jadwal`;
};

export function getSessionState(day, session, now = new Date()) {
  const [start, end] = session.time.split("–");
  if (!start || !end) return "UPCOMING";
  const timestamp = now.getTime();
  if (timestamp < atEventTime(day.date, start)) return "UPCOMING";
  if (timestamp <= atEventTime(day.date, end)) return "LIVE";
  return "ENDED";
}

export function getTicketAvailability(product, now = new Date()) {
  if (!product) return "UNAVAILABLE";
  if (product.status !== "AVAILABLE") return product.status;
  const lastValidDate = product.validDates?.at(-1);
  if (!lastValidDate) return "UNAVAILABLE";
  const saleCutoff = atEventTime(lastValidDate, EVENT.timing.eventEnd);
  return now.getTime() <= saleCutoff ? "AVAILABLE" : "EXPIRED";
}

export const getPurchasableTickets = (now = new Date()) => TICKETS.filter((product) => getTicketAvailability(product, now) === "AVAILABLE");

export function getTicketStatusCopy(status) {
  if (status === "AVAILABLE") return { label: "Tersedia", message: "" };
  if (status === "EXPIRED") return { label: "Tanggal berlalu", message: "Tiket tidak dapat dibeli karena tanggal berlakunya sudah berakhir." };
  if (status === "SOLD_OUT") return { label: "Tiket habis", message: "Produk tidak dapat dipilih karena stok sumber menunjukkan 0." };
  return { label: "Konfigurasi belum lengkap", message: "Checkout dinonaktifkan sampai mekanik produk dikonfirmasi organizer." };
}
