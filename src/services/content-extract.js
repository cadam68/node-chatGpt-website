const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require("path");
const maxFiles = -1;        // -1 : all content
// require('events').EventEmitter.defaultMaxListeners = maxFiles;

const srcDir = path.join(__basedir, "/data/articles_pdf/");

const savePdf = async (url, title) => {
    const URL = url
    const fileName = srcDir + title + ".pdf"
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(URL)
    // delete the file locally
    fs.unlinkSync(fileName);
    await page.pdf({ path: fileName})
    await browser.close()
}

async function getLinks(URL_base, ws) {
    // const URL_base = 'https://be.heureka.ch/de/fachthemen'
    let nbPdfGenerated=0;
    try {
        const URL = URL_base;
        const regex = /^https?:\/\/[^/]+(.+)$/;
        const match = URL.match(regex);
        const internalPath = match[1]; // /de/fachthemen
        // console.log(URL, internalPath)

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox','--disable-setuid-sandbox'],
        });
        const page = await browser.newPage()
        if(ws) ws.send(JSON.stringify({ type: 'message', level : 'info', value:`analysis ${URL}...` }));
        await page.goto(URL)

        let hrefs = await page.evaluate(
            () => Array.from(
                document.querySelectorAll('a[href]'),
                a => a.getAttribute('href')
            )
        );
        await browser.close();
        hrefs = hrefs.filter(url => url.startsWith(internalPath+'/'))      // '/de/fachthemen/'
        hrefs = hrefs.map(url => url.replace(internalPath,''));
        hrefs = [...new Set(hrefs)];
        if(maxFiles>0) hrefs = hrefs.slice(0, maxFiles);    // limit to maxFiles items during development phase

        nbPdfGenerated = hrefs.length;
        if(ws) ws.send(JSON.stringify({ type: 'message', level : 'info', value:`retrieve ${nbPdfGenerated} internal links` }));

        let completed=0;

        for (const ln of hrefs) {
            await savePdf(URL_base + ln, ln.split("/")[1]);
            if(ws) ws.send(JSON.stringify({ type: 'message', level : 'info', value:`generating pdf file ${ln.split("/")[1]}.pdf...` }));

            completed++;
            const percentComplete = Math.min(Math.ceil((completed / nbPdfGenerated) * 100), 100);
            if(ws) ws.send(JSON.stringify({ type: 'progress', percentComplete: percentComplete }));
        }
    } catch (error) {
        console.error(error)
        throw error;
        return -1
    }
    return nbPdfGenerated;
}

const getContent = async(URL_base, ws) => await getLinks(URL_base, ws);

module.exports = {getContent}
