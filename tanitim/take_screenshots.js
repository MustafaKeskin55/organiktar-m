const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = 'https://organiktar-m.albakarda.workers.dev';

    // Desktop
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(__dirname, 'assets', 'desktop_screenshot.png') });

    // Mobile
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(__dirname, 'assets', 'mobile_screenshot.png') });

    await browser.close();
    console.log('Screenshots saved.');
})();
