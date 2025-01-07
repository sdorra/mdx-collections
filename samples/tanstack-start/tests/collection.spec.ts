import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("should list available posts", async ({ page }) => {
  await expect(
    page.getByRole("heading", {
      name: "A Chameleon Critiqued Our Color Schemes",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "My Coffee Machine Was Hacked By A Tech-Savvy Panda",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "When a Panda Became Our Social Media Manager",
    }),
  ).toBeVisible();
});

test("should render post content", async ({ page }) => {
  const link = await page.getByRole("heading", {
    name: "A Chameleon Critiqued Our Color Schemes",
  });
  await link.click();

  await expect(
    page.getByRole("heading", { name: "The Color Commentary Begins" }),
  ).toBeVisible();
});
