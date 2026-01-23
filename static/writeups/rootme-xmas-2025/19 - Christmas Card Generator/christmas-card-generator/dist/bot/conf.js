import puppeteer from "puppeteer";

export const challenge = {
  name: "Christmas Card Generator",
  appUrl: new URL(process.env.WEBSITE_URL),
  rateLimit: 4, // max requests per 1 minute
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const visit = async (url) => {
  console.log(`start: ${url}`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/usr/bin/chromium",
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--js-flags=--noexpose_wasm,--jitless",
      '--disable-gpu',
      "--disable-features=HttpsFirstBalancedModeAutoEnable",
    ],
  });

  const context = await browser.createBrowserContext();

  try {
    const page1 = await context.newPage();

    await page1.goto(challenge.appUrl, {
      waitUntil: 'networkidle0'
    });
    const imageInput = await page1.waitForSelector('input[id=imageInput]');
    await imageInput.uploadFile('/flag.png');
    const uploadBtn = await page1.waitForSelector('button[id=uploadBtn]');
    await uploadBtn.click()
    await page1.waitForSelector('button[class=insert-btn]');
    await page1.close();

    const page2 = await context.newPage();
    await page2.goto(url, {
      waitUntil: 'networkidle0'
    });
    await sleep(1_000);
    await page2.close();
  } catch (e) {
    console.error(e);
  }

  await context.close();
  await browser.close();

  console.log(`end: ${url}`);
};
