import { test, expect } from "@playwright/test";

/**
 * Smoke E2E covering the critical student learning path shell.
 * Requires frontend + backend running locally.
 */
const BASE = process.env.E2E_BASE_URL || "http://localhost:5173";

test.describe("Yaser USMLE critical path smoke", () => {
  test("public home loads", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("body")).toBeVisible();
  });

  test("login page renders", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.getByRole("button").first()).toBeVisible();
  });

  test("courses explore loads", async ({ page }) => {
    await page.goto(`${BASE}/explore`);
    await expect(page.locator("body")).toBeVisible();
  });

  test("verify-email page loads", async ({ page }) => {
    await page.goto(`${BASE}/verify-email`);
    await expect(page.locator("body")).toContainText(/verify|تفعيل/i);
  });
});
