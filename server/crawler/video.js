const puppeteer = require('puppeteer');

// 详情页地址
const base = 'https://movie.douban.com/subject/';
const doubanId = '30327842';

const sleep = time => new Promise(resolve => {
  setTimeout(resolve, time);
});

(async () => {
  console.log('Fetch Video started... ');

  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    dumpio: false
  });

  const page = await browser.newPage();
  await page.goto(base + doubanId, {
    waitUntil: 'networkidle2'
  });
  await sleep(2000);

  const result = await page.evaluate(() => {
    let $ = window.$;
    let it = $('.label-trailer .related-pic-video');
    if (it && it.length > 0) {
      let link = it.attr('href');
      let cover = it.css('backgroundImage')
                    .replace('url("', '')
                    .replace('")', '');
    
      return {
        link,
        cover
      };
    }
    return {};
  });

  // 爬取视频地址
  let video;
  if (result.link) {
    await page.goto(result.link, {
      waitUntil: 'networkidle2'
    });

    await sleep(2000);
    video = await page.evaluate(() => {
      let $ = window.$;
      let it = $('source');

      if (it && it.length > 0) {
        return it.attr('src');
      }
      return '';
    });
  }

  const data = {
    doubanId,
    video,
    cover: result.cover
  };

  browser.close();

  process.send(data);
  process.exit(0);

})();
