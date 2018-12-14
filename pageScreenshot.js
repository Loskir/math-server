const puppeteer = require('puppeteer');

module.exports = async id => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`http://math.loskir.ru/${id}`);
  await page.setViewport({width:10,height:10});
  await page.waitFor(2000);
  const dimensions = await page.evaluate(() => {
    return {
      width: document.querySelector('#math').scrollWidth,
      height: document.querySelector('#math').scrollHeight,
      deviceScaleFactor: window.devicePixelRatio
    };
  });
  console.log(dimensions);
  await page.setViewport(dimensions);
  await page.screenshot({path: `./img/${id}.png`});

  await browser.close();
};