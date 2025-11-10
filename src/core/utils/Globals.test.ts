import { describe, expect, test } from "vitest";
import { OATTS_ROOT } from "./Globals";

describe("Constants", () => {
  test("OATTS_ROOT has expected value", () => {
    expect(OATTS_ROOT).toEqual("/oatts");
  });
});
