const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ args: ["--headless"] });
  const page = await browser.newPage();

  page.on("requestfailed", (request) => {
    const failure = request.failure();
    console.log(
      "REQUESTFAILED",
      request.url(),
      failure && failure.message,
      failure && failure.code,
    );
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      console.log("HTTP_BAD", response.status(), response.url());
    }
  });

  page.on("pageerror", (err) => {
    console.log("PAGEERROR", err.message);
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("BROWSERERROR", msg.text());
    }
  });

  await page.goto("http://localhost:3000/index.html", {
    waituntil: "load",
    timeout: 5000,
  });
  await page.waitForTimeout(1500);

  const footerText = await page
    .$eval("#footer-placeholder", (el) => el.innerText || "")
    .catch((e) => "ERR " + e.message);
  const footerCount = await page.$$eval(
    "#footer-placeholder footer",
    (els) => els.length,
  );

  console.log("FOOTER_COUNT", footerCount);
  console.log("FOOTER_TEXT_LEN", footerText.length);
  console.log("FOOTER_TEXT_HEAD", (footerText || "").slice(0, 80));

  await browser.close();
})();
