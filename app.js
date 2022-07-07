const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');
const express = require('express')
const app = express()
const port = 3000
const fs = require('fs');
const baseUrl = "https://www.tokopedia.com";
const searchUrl = baseUrl + "/search?st=product";
const randomAgent = randomUseragent.getRandom(function (ua) {
    return ua.osName === 'Linux';//change with your OS
});

console.log(randomAgent);

async function scrapping(paramArray = null) {
    var url = searchUrl;
    Object.entries(paramArray).forEach(entry => {
        const [key, value] = entry;
        url += `&${key}=${value}`;
    });
    try {
        const browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        const context = await browser.createIncognitoBrowserContext();
        const page = await context.newPage();
        await page.setJavaScriptEnabled(true);
        await page.setUserAgent(randomAgent);
        await page.goto(url, { waituntil: 'domcontentloaded', timeout: 0 });
        await page.setViewport({
            width: 1200,
            height: 800
        });

        await page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight - window.innerHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });



        const body = await page.evaluate(() => {
            return document.querySelector('body').innerHTML;
        });

        const $ = cheerio.load(body);
        const listItems = $('[data-testid="master-product-card"]');

        if(listItems.length <= 0){
            if($("h1").text() == "Access Denied"){
                return { error: body.toString() };
            }
            // console.log(body);
            // fs.writeFile('body.txt', body, function (err) {
            //     if (err) return console.log(err);
            //     console.log('Body > body.txt');
            // });
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

        await browser.close();
        return resulst;
    } catch (error) {
        return { error: error.toString() };
    }
}

app.get('/', async (req, res) => {
    var result = await scrapping(req.query);
    // res.send('Hello World!')
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result));
});

app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening on port ${port}`)
})

