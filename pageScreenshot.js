const puppeteer = require('puppeteer');

module.exports = async id => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`http://math.loskir.ru/${id}`);
    await page.setViewport({width:1000, height:1000});
    await page.waitFor('#math');
    await page.waitFor(300);
    const clip = await page.evaluate(() => {
        let br = document.querySelector('#math').getBoundingClientRect();
        return {
            height: Math.round(br.height),
            width: Math.round(br.width)
        };
    });
    await page.setViewport(clip);
    await page.screenshot({path: `./img/${id}.png`});

    await browser.close();
};