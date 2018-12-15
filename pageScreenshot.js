const puppeteer = require('puppeteer');

module.exports = async id => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http://math.loskir.ru/${id}`);
    await page.setViewport({width:1000, height:1000});
    await page.waitFor('#math');
    await page.waitFor(600);
    await page.emulateMedia('print');
    let dimensions = await page.evaluate(() => {
        return {
            height: Math.round(document.body.offsetHeight),
            width: Math.round(document.body.offsetWidth),
            deviceScaleFactor: window.devicePixelRatio
        };
    });
    await page.setViewport(dimensions);
    await page.screenshot({path: `./img/${id}.png`});

    await browser.close();
};