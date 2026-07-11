const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // We will use file:// protocol to load the local index.html
    const filePath = 'file://' + path.resolve(__dirname, 'index.html');
    
    // Emulate screen media to apply the exact CSS styles
    await page.emulateMediaType('screen');
    
    // Set a high resolution viewport
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    
    await page.goto(filePath, { waitUntil: 'networkidle2' });
    
    const outputPath = path.join(__dirname, 'assets', 'ciftcidenkapina-brosur.pdf');
    
    await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        scale: 0.7,
        margin: {
            top: '0px',
            bottom: '0px',
            left: '0px',
            right: '0px'
        }
    });

    await browser.close();
    console.log('PDF generated at ' + outputPath);
})();
