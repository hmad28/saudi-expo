import { describe, expect, it } from "vitest";
import { SCHEDULE, TICKETS } from "../data/eventConfig";
import { getEventDateKey, getEventPhase, getRelevantScheduleDay, getScheduleHref, getSessionState, getTicketAvailability } from "./eventTime";

describe("event clock uses Asia/Jakarta rules", () => {
  it("selects the actual event day across UTC boundaries", () => {
    const jakartaMorning = new Date("2026-08-01T01:00:00.000Z");
    expect(getEventDateKey(jakartaMorning)).toBe("2026-08-01");
    expect(getRelevantScheduleDay(jakartaMorning).id).toBe("day-2");
    expect(getScheduleHref(jakartaMorning)).toBe("/jadwal?day=2#jadwal");
  });

  it("does not sell a ticket after its valid day", () => {
    const dayOne = TICKETS.find((ticket) => ticket.id === "regular-d1");
    expect(getTicketAvailability(dayOne, new Date("2026-07-31T10:00:00+07:00"))).toBe("AVAILABLE");
    expect(getTicketAvailability(dayOne, new Date("2026-07-31T18:00:01+07:00"))).toBe("EXPIRED");
  });

  it("marks sessions and the event from absolute timestamps", () => {
    const opening = SCHEDULE[0].sessions[0];
    expect(getSessionState(SCHEDULE[0], opening, new Date("2026-07-31T08:45:00+07:00"))).toBe("LIVE");
    expect(getEventPhase(new Date("2026-08-02T18:00:01+07:00"))).toBe("ENDED");
  });
});
