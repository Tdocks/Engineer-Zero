import { expect, test } from "@playwright/test";

test.describe("learner core flows", () => {
  test("a visitor can begin a protected, randomized baseline", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { name: /build the judgment/i })).toBeVisible();
    await page.getByLabel("Name").fill("Learner");
    await page.getByRole("button", { name: /build my starting plan/i }).click();
    await expect(page.getByRole("heading", { name: /show us how you think/i })).toBeVisible();
    await expect(page.getByText(/answer choices are randomized/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue →" })).toBeDisabled();
  });

  test("Interview Studio loads protected IT Support prompts without exposing examiner guidance", async ({ page }) => {
    await page.goto("/api/course/interviews?track=it-support-technician");
    const payload = await page.locator("body").textContent();
    expect(payload).toContain("it-interview-01-01");
    expect(payload).not.toContain("Strong answer shape");
    expect(payload).not.toContain("commonMiss");
  });

  test("the course runner deep link has a readable return path on a narrow viewport", async ({ page }) => {
    await page.goto("/learn/applied-ai-operations/module/aio-sprint-01-role-narrative");
    await expect(page.getByRole("button", { name: /return to learning/i })).toBeVisible();
    await expect(page.getByText(/continue to knowledge check/i)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("a visitor can skip the baseline and start at zero", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { name: /build the judgment/i })).toBeVisible();
    await page.getByLabel("Name").fill("Zero Starter");
    await page.getByRole("button", { name: /skip baseline — start at zero/i }).click();
    await expect(page.getByRole("heading", { name: /start at zero/i })).toBeVisible();
    await page.getByRole("button", { name: /open today.?s work/i }).click();
    await expect(page.getByText(/personal pilot/i)).toBeVisible();
  });

  test("skipBaseline query opens the start-at-zero plan", async ({ page }) => {
    await page.goto("/learn?skipBaseline=1");
    await expect(page.getByRole("heading", { name: /start at zero/i })).toBeVisible();
    await expect(page.getByText(/no baseline yet/i)).toBeVisible();
  });
});
