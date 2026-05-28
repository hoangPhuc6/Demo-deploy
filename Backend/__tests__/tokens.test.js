const { parseDuration } = require("../src/utils/tokens");

describe("parseDuration", () => {
  describe("Abnormal inputs", () => {
    test("TC1: returns 0 when input is a number", () => {
      expect(parseDuration(42)).toBe(0);
    });

    test("TC1: returns 0 when input is null", () => {
      expect(parseDuration(null)).toBe(0);
    });

    test("TC1: returns 0 when input is undefined", () => {
      expect(parseDuration(undefined)).toBe(0);
    });

    test("TC1: returns 0 when input is an object", () => {
      expect(parseDuration({})).toBe(0);
    });

    test("TC1: returns 0 when input is a boolean", () => {
      expect(parseDuration(true)).toBe(0);
    });
  });

  describe("Abnormal inputs - invalid strings", () => {
    test("TC2: returns 0 for empty string", () => {
      expect(parseDuration("")).toBe(0);
    });

    test("TC3: returns 0 for invalid unit (1x)", () => {
      expect(parseDuration("1x")).toBe(0);
    });

    test("TC3: returns 0 for non-matching string (abc)", () => {
      expect(parseDuration("abc")).toBe(0);
    });
  });

  describe("Boundary inputs", () => {
    test("TC4: returns 0 when n=0 (zero multiplier)", () => {
      expect(parseDuration("0m")).toBe(0);
    });
  });

  describe("Normal inputs - valid durations", () => {
    test("TC5: parses seconds (30s)", () => {
      expect(parseDuration("30s")).toBe(30000);
    });

    test("TC6: parses minutes (15m)", () => {
      expect(parseDuration("15m")).toBe(900000);
    });

    test("TC7: parses hours (1h)", () => {
      expect(parseDuration("1h")).toBe(3600000);
    });

    test("TC8: parses days (7d)", () => {
      expect(parseDuration("7d")).toBe(604800000);
    });

    test("TC9: parses uppercase unit (15M)", () => {
      expect(parseDuration("15M")).toBe(900000);
    });

    test("TC9: parses mixed case (15H)", () => {
      expect(parseDuration("15H")).toBe(54000000);
    });

    test("TC9: parses lowercase (7D)", () => {
      expect(parseDuration("7D")).toBe(604800000);
    });
  });
});
