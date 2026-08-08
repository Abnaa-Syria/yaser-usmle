import { describe, expect, it } from "vitest";
import { isFeatureEnabled, platformFeatures } from "./features";

describe("platform feature flags", () => {
  it("defaults gated Phase 1 features to disabled", () => {
    expect(platformFeatures.wallet).toBe(false);
    expect(platformFeatures.publicInstructorCatalog).toBe(false);
    expect(isFeatureEnabled("wallet")).toBe(false);
  });
});
