// The holiday look (banner, strip, accents, snow) renders only until this
// instant. The $350 PLATOS#1 stand price does NOT expire; only the look does.
// 2027-01-01 00:00 Pacific (PST, UTC-8) = 2027-01-01 08:00 UTC.
export const HOLIDAY_END = new Date("2027-01-01T08:00:00Z");

export function isHolidayActive(now: Date = new Date()): boolean {
  return now.getTime() < HOLIDAY_END.getTime();
}
