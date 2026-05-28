const { timeRangesOverlap, toMySQLDateTime } = require("../src/utils/datetime");

describe("timeRangesOverlap", () => {
  describe("Normal inputs - no overlap", () => {
    test("TC1: Range1 ends BEFORE Range2 starts (08:00-09:00 vs 10:00-12:00)", () => {
      const start1 = new Date("2026-05-20T08:00:00");
      const end1 = new Date("2026-05-20T09:00:00");
      const start2 = new Date("2026-05-20T10:00:00");
      const end2 = new Date("2026-05-20T12:00:00");
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(false);
    });

    test("TC2: Range1 starts AFTER Range2 ends (11:00-12:00 vs 08:00-10:00)", () => {
      const start1 = new Date("2026-05-20T11:00:00");
      const end1 = new Date("2026-05-20T12:00:00");
      const start2 = new Date("2026-05-20T08:00:00");
      const end2 = new Date("2026-05-20T10:00:00");
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(false);
    });
  });

  describe("Boundary inputs - touching edges", () => {
    test("TC3: Range1 end equals Range2 start (e1 = s2, no overlap)", () => {
      const start1 = new Date("2026-05-20T08:00:00");
      const end1 = new Date("2026-05-20T10:00:00");
      const start2 = new Date("2026-05-20T10:00:00");
      const end2 = new Date("2026-05-20T12:00:00");
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(false);
    });

    test("TC4: Range2 end equals Range1 start (e2 = s1, no overlap)", () => {
      const start1 = new Date("2026-05-20T10:00:00");
      const end1 = new Date("2026-05-20T12:00:00");
      const start2 = new Date("2026-05-20T08:00:00");
      const end2 = new Date("2026-05-20T10:00:00");
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(false);
    });
  });

  describe("Normal inputs - overlap", () => {
    test("TC5: Range1 partially overlaps Range2 (08:00-11:00 vs 10:00-13:00)", () => {
      const start1 = new Date("2026-05-20T08:00:00");
      const end1 = new Date("2026-05-20T11:00:00");
      const start2 = new Date("2026-05-20T10:00:00");
      const end2 = new Date("2026-05-20T13:00:00");
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(true);
    });

    test("TC6: Range1 completely contains Range2 (08:00-14:00 vs 10:00-12:00)", () => {
      const start1 = new Date("2026-05-20T08:00:00");
      const end1 = new Date("2026-05-20T14:00:00");
      const start2 = new Date("2026-05-20T10:00:00");
      const end2 = new Date("2026-05-20T12:00:00");
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(true);
    });

    test("TC7: Ranges are identical (09:00-11:00 vs 09:00-11:00)", () => {
      const start1 = new Date("2026-05-20T09:00:00");
      const end1 = new Date("2026-05-20T11:00:00");
      const start2 = new Date("2026-05-20T09:00:00");
      const end2 = new Date("2026-05-20T11:00:00");
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(true);
    });

    test("TC7: Range2 contains Range1 (reverse of TC6)", () => {
      const start1 = new Date("2026-05-20T10:00:00");
      const end1 = new Date("2026-05-20T12:00:00");
      const start2 = new Date("2026-05-20T08:00:00");
      const end2 = new Date("2026-05-20T14:00:00");
      expect(timeRangesOverlap(start1, end1, start2, end2)).toBe(true);
    });
  });
});

describe("toMySQLDateTime", () => {
  describe("Abnormal inputs", () => {
    test("TC1: returns null for null input", () => {
      expect(toMySQLDateTime(null)).toBe(null);
    });

    test("TC1: returns null for undefined input", () => {
      expect(toMySQLDateTime(undefined)).toBe(null);
    });

    test("TC1: returns null for falsy value (0)", () => {
      expect(toMySQLDateTime(0)).toBe(null);
    });

    test("TC2: returns null for invalid date string", () => {
      expect(toMySQLDateTime("not-a-date")).toBe(null);
    });
  });

  describe("Normal inputs", () => {
    test("TC3: parses ISO 8601 string correctly", () => {
      const result = toMySQLDateTime("2026-05-20T14:30:00.000Z");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    test("TC5: parses Unix timestamp (milliseconds)", () => {
      const result = toMySQLDateTime(1748000000000);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
  });

  describe("Boundary inputs - padding", () => {
    test("TC6: pads single-digit month and day (2000-01-05)", () => {
      const date = new Date(2000, 0, 5, 9, 3, 7);
      const result = toMySQLDateTime(date);
      expect(result).toBe("2000-01-05 09:03:07");
    });

    test("TC4: pads month in Date object (May 20 = month 4)", () => {
      const date = new Date(2026, 4, 20, 14, 30, 0);
      const result = toMySQLDateTime(date);
      expect(result).toBe("2026-05-20 14:30:00");
    });
  });
});
