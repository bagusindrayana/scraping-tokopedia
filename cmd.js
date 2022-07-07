const cheerio = require("cheerio");
const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');

(async () => {
    console.time('timeExecute');
    const url = "https://www.tokopedia.com/search?st=product&q=laptop";
    const randomAgent = randomUseragent.getRandom(function (ua) {
        return (ua.osName === "Linux") && (ua.browserName === 'Firefox' || ua.browserName === 'Chrome');
    });
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
    const context = await browser.createIncognitoBrowserContext();//mode penyamaran
    const page = await context.newPage();//membuat tab baru
    await page.setJavaScriptEnabled(true);//aktifkan javascript
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36");//setting user agent
    await page.goto(url, { waituntil: 'domcontentloaded', timeout: 0 });//tunggu proses dom/load pagenya selesai
    const body = await page.evaluate(() => {
        return document.querySelector('body').innerHTML;
    });//mendapatkan isi tag html body

    const $ = cheerio.load(body);
    const listItems = $('[data-testid="master-product-card"]');
    if(listItems.length <= 0){
        console.log(body);
    }

    var resulst = [];
    listItems.each(function (idx, el) {
        var nama = $('[data-testid="spnSRPProdName"]', el).text();
        var harga = $('[data-testid="spnSRPProdPrice"]', el).text();
        var link = $('a[href]', el).attr("href");
        if (harga != null && harga != "") {
            resulst.push({
                "nama": nama,
                "harga": harga,
                "link": link
            });
        }

    });

    console.dir(resulst);


    await browser.close();//close browser puppeteer jika sudah selesai
    console.timeEnd('timeExecute')
})();