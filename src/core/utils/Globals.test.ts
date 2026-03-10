
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { describe, expect, test } from "vitest";
import { OATTS_ROOT } from "./Globals";

describe("Constants", () => {
  test("OATTS_ROOT has expected value", () => {
    expect(OATTS_ROOT).toEqual("/oatts");
  });
});
