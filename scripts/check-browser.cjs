const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.BASE_URL || "http://127.0.0.1:4173/";
const output = fs.mkdtempSync(path.join(os.tmpdir(), "allergyaid-check-"));
(async () => {
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      serviceWorkers: "block",
    });
    // Do not send analytics or a real contact message during local testing.
    await context.route(/googletagmanager\.com/, (route) => route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    await page.screenshot({
      path: path.join(output, "home-desktop.png"),
      fullPage: true,
    });
    await page
      .getByRole("link", { name: "Find a restaurant", exact: true })
      .click();
    const search = page.getByRole("searchbox", {
      name: "Search restaurants",
      exact: true,
    });
    assert.equal(await page.locator(".restaurant-card:visible").count(), 11);
    await search.fill("nothing-here");
    assert.equal(await page.locator("#noResults").isVisible(), true);
    await search.fill("chick fil a");
    assert.equal(await page.locator(".restaurant-card:visible").count(), 1);
    assert.equal(await page.locator("#noResults").isVisible(), false);
    await search.fill('<img src=x onerror="window.searchInjected=true">');
    assert.equal(await page.locator("#noResults img").count(), 0);
    assert.equal(await page.evaluate(() => window.searchInjected), undefined);
    await search.press("Escape");
    assert.equal(await page.locator(".restaurant-card:visible").count(), 11);
    await page.screenshot({
      path: path.join(output, "restaurants-desktop.png"),
      fullPage: true,
    });
    // Each restaurant's filtered names must match its original source data exactly.
    for (const file of fs
      .readdirSync(path.join(__dirname, "../data"))
      .filter((file) => file.endsWith(".json") && file !== "template.json")) {
      const slug = file.replace(".json", "");
      const data = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../data", file)),
      );
      await page.goto(`${base}allergen-picker.html?name=${slug}`);
      await page.waitForFunction(
        () => !document.querySelector('button[type="submit"]').disabled,
      );
      const inputs = page.locator('input[name="allergen"]');
      const values = await inputs.evaluateAll((inputs) =>
        inputs.map((input) => input.value),
      );
      assert.equal(
        new Set(values).size,
        values.length,
        `${slug}: duplicate options`,
      );
      const selected = values.slice(0, 2);
      for (const value of selected)
        await page.locator(`input[value="${value}"]`).check();
      await page.getByRole("button", { name: "Show safe menu" }).click();
      await page.waitForURL("**/safe-menu.html");
      const expected = data.items
        .filter(
          (item) =>
            !item.allergens.some((a) =>
              selected.includes(
                (typeof a === "string" ? a : a.id).toLowerCase(),
              ),
            ),
        )
        .map((item) => item.name)
        .sort();
      const actual = (
        await page.locator(".menu-item h3").allTextContents()
      ).sort();
      assert.deepEqual(actual, expected, `${slug}: incorrect filtering`);
      if (slug === "chickfila") {
        await page.screenshot({
          path: path.join(output, "menu-desktop.png"),
          fullPage: true,
        });
        const summary = page.locator("summary").first();
        await summary.focus();
        await page.keyboard.press("Enter");
        assert.equal(
          await page.locator("details").first().getAttribute("open"),
          null,
        );
        await page.keyboard.press("Enter");
        assert.notEqual(
          await page.locator("details").first().getAttribute("open"),
          null,
        );
        await page
          .locator("#menuItemSearch")
          .fill('<img src=x onerror="window.menuInjected=true">');
        assert.equal(await page.locator("#menuContainer img").count(), 0);
        await page.locator("#menuItemSearch").fill("unlikely-match-xyz");
        assert.equal(
          await page.locator("#menuContainer .empty-state").isVisible(),
          true,
        );
        await page.locator("#menuItemSearch").press("Escape");
        assert.equal(await page.locator(".menu-item").count(), expected.length);
      }
      await page.getByRole("link", { name: "Edit allergen choices" }).click();
      await page.waitForFunction(
        () => !document.querySelector('button[type="submit"]').disabled,
      );
      assert.equal(
        await page.locator("input:checked").count(),
        selected.length,
        `${slug}: lost selection`,
      );
    }
    // No selection is explicitly a full menu.
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(`${base}allergen-picker.html?name=innout`);
    await page.waitForFunction(
      () => !document.querySelector('button[type="submit"]').disabled,
    );
    await page.getByRole("button", { name: "Show safe menu" }).click();
    await page.waitForURL("**/safe-menu.html");
    assert.match(
      await page.locator("#filterSummary").textContent(),
      /full menu/,
    );
    assert.equal(await page.locator(".menu-item").count(), 7);
    // Mobile layouts, local images, and navigation are checked across every page.
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "index.html",
        "restaurants.html",
        "allergen-picker.html?name=halalguys",
        "safe-menu.html",
        "partners.html",
        "contact.html",
        "offline.html",
      ]) {
        await page.goto(base + route);
        if (route.startsWith("allergen-picker"))
          await page.waitForFunction(
            () => !document.querySelector('button[type="submit"]').disabled,
          );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
          `${route}: overflow at ${width}px`,
        );
        assert.deepEqual(
          await page
            .locator("img")
            .evaluateAll((images) =>
              images
                .filter((img) => !img.complete || img.naturalWidth === 0)
                .map((img) => img.src),
            ),
          [],
          `${route}: broken images`,
        );
        if (width === 390 && route !== "offline.html")
          await page.screenshot({
            path: path.join(output, route.split(".")[0] + "-mobile.png"),
            fullPage: true,
          });
      }
    }
    await page.goto(`${base}contact.html`);
    assert.equal(await page.locator("form").count(), 1);
    assert.equal(
      await page.locator("form").getAttribute("action"),
      "https://formsubmit.co/allergyaidteam@gmail.com",
    );
    assert.equal(
      await page.locator("form").evaluate((form) => form.checkValidity()),
      false,
    );
    await page.getByLabel("Your name").fill("Browser Test");
    await page.getByLabel("Email address").fill("test@example.com");
    await page
      .getByLabel("Your message")
      .fill("Local validation only; do not send.");
    assert.equal(
      await page.locator("form").evaluate((form) => form.checkValidity()),
      true,
    );
    for (const route of [
      "allergen-picker.html",
      "allergen-picker.html?name=missing",
      "allergen-picker.html?name=../template",
    ]) {
      await page.goto(base + route);
      await page.locator("#formError").waitFor({ state: "visible" });
      assert.equal(
        await page
          .getByRole("button", { name: "Show safe menu" })
          .isDisabled(),
        true,
      );
    }
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(`${base}safe-menu.html`);
    assert.equal(
      await page.getByRole("link", { name: "Find a restaurant" }).isVisible(),
      true,
    );
    await page.evaluate(() =>
      sessionStorage.setItem("filteredMenu", "{bad json"),
    );
    await page.reload();
    assert.equal(
      await page.getByRole("link", { name: "Find a restaurant" }).isVisible(),
      true,
    );
    assert.deepEqual(errors, [], "Uncaught browser errors");
    // Content remains visible without JavaScript; menus explain that JS is needed.
    const noJs = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const plain = await noJs.newPage();
    await plain.goto(base);
    assert.equal(await plain.locator(".restaurant-card:visible").count(), 4);
    await plain.goto(`${base}restaurants.html`);
    assert.equal(await plain.locator(".restaurant-card:visible").count(), 11);
    await noJs.close();
    await context.close();
    // Test actual service worker installation and its offline fallback independently.
    const pwa = await browser.newContext();
    await pwa.route(/googletagmanager\.com/, (route) => route.abort());
    const offline = await pwa.newPage();
    await offline.goto(base);
    await offline.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await offline.reload();
    await offline.waitForFunction(
      () => navigator.serviceWorker.controller !== null,
    );
    await pwa.setOffline(true);
    await offline.goto(`${base}restaurants.html`);
    assert.match(await offline.locator("h1").textContent(), /little pause/);
    assert.equal(
      await offline
        .locator("h1")
        .evaluate((el) => getComputedStyle(el).fontSize !== "32px"),
      true,
    );
    await pwa.close();
    console.log(
      "PASS: 11 restaurant flows, search, keyboard controls, error recovery, forms, 4 viewport sizes, no-JS visibility, and offline fallback.",
    );
    console.log(`Screenshots: ${output}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
