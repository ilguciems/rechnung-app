import {
  DEFAULT_STATS_RANGE,
  isStatsRange,
  resolveStatsRange,
} from "../stats-range";

// Local dates keep the assertions independent of the machine timezone.
const now = new Date(2026, 10, 7, 12, 0, 0);

describe("isStatsRange", () => {
  it("accepts the supported ranges and rejects everything else", () => {
    expect(isStatsRange("3m")).toBe(true);
    expect(isStatsRange("6m")).toBe(true);
    expect(isStatsRange("12m")).toBe(true);
    expect(isStatsRange("ytd")).toBe(true);
    expect(isStatsRange("lastYear")).toBe(true);
    expect(isStatsRange("yearBeforeLast")).toBe(true);

    expect(isStatsRange(null)).toBe(false);
    expect(isStatsRange("")).toBe(false);
    expect(isStatsRange("24m")).toBe(false);
    expect(DEFAULT_STATS_RANGE).toBe("6m");
  });
});

describe("resolveStatsRange", () => {
  it("covers the requested number of months including the current one", () => {
    expect(resolveStatsRange("3m", now)).toEqual({
      start: new Date(2026, 8, 1),
      end: new Date(2026, 11, 1),
      monthCount: 3,
    });

    expect(resolveStatsRange("6m", now)).toEqual({
      start: new Date(2026, 5, 1),
      end: new Date(2026, 11, 1),
      monthCount: 6,
    });

    expect(resolveStatsRange("12m", now)).toEqual({
      start: new Date(2025, 11, 1),
      end: new Date(2026, 11, 1),
      monthCount: 12,
    });
  });

  it("starts the year-to-date range at January", () => {
    expect(resolveStatsRange("ytd", now)).toEqual({
      start: new Date(2026, 0, 1),
      end: new Date(2027, 0, 1),
      monthCount: 11,
    });

    const january = new Date(2026, 0, 15, 12, 0, 0);
    expect(resolveStatsRange("ytd", january)).toEqual({
      start: new Date(2026, 0, 1),
      end: new Date(2027, 0, 1),
      monthCount: 1,
    });
  });

  it("bounds past calendar years so they stop at the next January", () => {
    expect(resolveStatsRange("lastYear", now)).toEqual({
      start: new Date(2025, 0, 1),
      end: new Date(2026, 0, 1),
      monthCount: 12,
    });

    expect(resolveStatsRange("yearBeforeLast", now)).toEqual({
      start: new Date(2024, 0, 1),
      end: new Date(2025, 0, 1),
      monthCount: 12,
    });
  });
});
