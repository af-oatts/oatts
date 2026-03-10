
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { describe, it, expect } from "vitest";
import { FromIsoTimespan, SecondsToTimeString } from "./TimeStuff";

describe("TimeStuff utilities", () => {
  describe("FromIsoTimespan", () => {
    it("should parse a complete ISO 8601 duration string", () => {
      const result = FromIsoTimespan("P1Y2M3W4DT5H6M7S");
      expect(result).toEqual({
        years: 1,
        months: 2,
        weeks: 3,
        days: 4,
        hours: 5,
        minutes: 6,
        seconds: 7,
      });
    });

    it("should return undefined for duration with only years (missing T)", () => {
      const result = FromIsoTimespan("P5Y");
      expect(result).toBeUndefined();
    });

    it("should return undefined for duration with only months (missing T)", () => {
      const result = FromIsoTimespan("P3M");
      expect(result).toBeUndefined();
    });

    it("should return undefined for duration with only weeks (missing T)", () => {
      const result = FromIsoTimespan("P2W");
      expect(result).toBeUndefined();
    });

    it("should return undefined for duration with only days (missing T)", () => {
      const result = FromIsoTimespan("P10D");
      expect(result).toBeUndefined();
    });

    it("should parse duration with only time components", () => {
      const result = FromIsoTimespan("PT2H30M45S");
      expect(result).toEqual({
        years: NaN,
        months: NaN,
        weeks: NaN,
        days: NaN,
        hours: 2,
        minutes: 30,
        seconds: 45,
      });
    });

    it("should parse duration with only hours", () => {
      const result = FromIsoTimespan("PT8H");
      expect(result).toEqual({
        years: NaN,
        months: NaN,
        weeks: NaN,
        days: NaN,
        hours: 8,
        minutes: NaN,
        seconds: NaN,
      });
    });

    it("should parse duration with only minutes", () => {
      const result = FromIsoTimespan("PT45M");
      expect(result).toEqual({
        years: NaN,
        months: NaN,
        weeks: NaN,
        days: NaN,
        hours: NaN,
        minutes: 45,
        seconds: NaN,
      });
    });

    it("should parse duration with only seconds", () => {
      const result = FromIsoTimespan("PT30S");
      expect(result).toEqual({
        years: NaN,
        months: NaN,
        weeks: NaN,
        days: NaN,
        hours: NaN,
        minutes: NaN,
        seconds: 30,
      });
    });

    it("should parse mixed date and time components", () => {
      const result = FromIsoTimespan("P1Y2DT3H4M");
      expect(result).toEqual({
        years: 1,
        months: NaN,
        weeks: NaN,
        days: 2,
        hours: 3,
        minutes: 4,
        seconds: NaN,
      });
    });

    it("should parse zero values", () => {
      const result = FromIsoTimespan("P0Y0M0W0DT0H0M0S");
      expect(result).toEqual({
        years: 0,
        months: 0,
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
    });

    it("should parse large numbers", () => {
      const result = FromIsoTimespan("P999Y999M999W999DT999H999M999S");
      expect(result).toEqual({
        years: 999,
        months: 999,
        weeks: 999,
        days: 999,
        hours: 999,
        minutes: 999,
        seconds: 999,
      });
    });

    it("should return undefined for invalid format - missing P", () => {
      const result = FromIsoTimespan("1Y2M3DT4H5M6S");
      expect(result).toBeUndefined();
    });

    it("should return undefined for invalid format - missing T for time", () => {
      const result = FromIsoTimespan("P1Y2M3D4H5M6S");
      expect(result).toBeUndefined();
    });

    it("should return undefined for completely invalid string", () => {
      const result = FromIsoTimespan("invalid");
      expect(result).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      const result = FromIsoTimespan("");
      expect(result).toBeUndefined();
    });

    it("should return undefined for just P", () => {
      const result = FromIsoTimespan("P");
      expect(result).toBeUndefined();
    });

    it("should parse just PT (empty time section)", () => {
      const result = FromIsoTimespan("PT");
      expect(result).toEqual({
        years: NaN,
        months: NaN,
        weeks: NaN,
        days: NaN,
        hours: NaN,
        minutes: NaN,
        seconds: NaN,
      });
    });

    it("should not match decimal numbers (regex only captures integers)", () => {
      const result = FromIsoTimespan("PT1.5H");
      expect(result).toEqual({
        years: NaN,
        months: NaN,
        weeks: NaN,
        days: NaN,
        hours: NaN,
        minutes: NaN,
        seconds: NaN,
      });
    });
  });

  describe("SecondsToTimeString", () => {
    it("should return empty string for undefined input", () => {
      const result = SecondsToTimeString(undefined);
      expect(result).toBe("");
    });

    it("should format seconds only (less than 1 minute)", () => {
      const result = SecondsToTimeString(30);
      expect(result).toBe("0m");
    });

    it("should format minutes only (less than 1 hour)", () => {
      const result = SecondsToTimeString(300); // 5 minutes
      expect(result).toBe("5m");
    });

    it("should format minutes with partial seconds", () => {
      const result = SecondsToTimeString(330); // 5 minutes 30 seconds
      expect(result).toBe("5m");
    });

    it("should format exactly 1 hour", () => {
      const result = SecondsToTimeString(3600);
      expect(result).toBe("1h 0m");
    });

    it("should format hours and minutes", () => {
      const result = SecondsToTimeString(3900); // 1 hour 5 minutes
      expect(result).toBe("1h 5m");
    });

    it("should format multiple hours and minutes", () => {
      const result = SecondsToTimeString(7890); // 2 hours 11 minutes 30 seconds
      expect(result).toBe("2h 11m");
    });

    it("should format large number of hours", () => {
      const result = SecondsToTimeString(36000); // 10 hours
      expect(result).toBe("10h 0m");
    });

    it("should format very large duration", () => {
      const result = SecondsToTimeString(90061); // 25 hours 1 minute 1 second
      expect(result).toBe("25h 1m");
    });

    it("should handle zero seconds", () => {
      const result = SecondsToTimeString(0);
      expect(result).toBe("0m");
    });

    it("should handle fractional seconds (floor behavior)", () => {
      const result = SecondsToTimeString(3661.9); // 1 hour 1 minute 1.9 seconds
      expect(result).toBe("1h 1m");
    });

    it("should handle negative numbers by flooring to 0", () => {
      const result = SecondsToTimeString(-3600);
      expect(result).toBe("0m");
    });

    it("should handle very small positive numbers", () => {
      const result = SecondsToTimeString(0.5);
      expect(result).toBe("0m");
    });

    it("should format exactly 59 minutes 59 seconds", () => {
      const result = SecondsToTimeString(3599);
      expect(result).toBe("59m");
    });

    it("should format 1 hour 59 minutes 59 seconds", () => {
      const result = SecondsToTimeString(7199);
      expect(result).toBe("1h 59m");
    });
  });
});
