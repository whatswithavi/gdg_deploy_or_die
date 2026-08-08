import { test, expect } from "@playwright/test";

const VULNERABLE_SNIPPET = `
function getUser(id) {
  const query = "SELECT * FROM users WHERE id = " + id;
  const apiKey = "sk-hardcoded-secret-12345";
  return db.query(query);
}
`;

test("pasting a vulnerable snippet and reviewing shows flagged issues", async ({ page }) => {
  await page.goto("/");

  await page.fill("#code-input", VULNERABLE_SNIPPET);
  await page.click("#review-btn");

  await expect(page.locator("#status")).not.toHaveText("Reviewing...", { timeout: 20000 });
  await expect(page.locator("#results li").first()).toBeVisible({ timeout: 20000 });
});

test("submitting empty input shows a prompt to paste code, no request made", async ({ page }) => {
  await page.goto("/");

  await page.click("#review-btn");

  await expect(page.locator("#status")).toHaveText("Paste some code first.");
  await expect(page.locator("#results li")).toHaveCount(0);
});
