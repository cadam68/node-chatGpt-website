const fs = require("fs");
const pdf = require("pdf-extraction");
const replaceSpecialCharacters = require('replace-special-characters');
const path = require("path");
const {isPallier, delay} = require("./commun");

const srcDirPdf = path.join(__basedir, "/data/articles_pdf/");
const srcDirJs = path.join(__basedir, "/data/articles_js/");

const writejs = async (art) => {
    let dataContent = fs.readFileSync(srcDirPdf + art);

    await pdf(dataContent).then(function (dat) {
        let title = art.replace('.pdf', '')
        title = title.replaceAll('-', ' ')
        titleJs = title.replaceAll(' ', '')
        let fileName = srcDirJs + titleJs + ".js";
        dat.text.replace(/[^\w\s]/gi, '')
        let t = "const article = `"
        t += replaceSpecialCharacters(dat.text)
        t += "`\n\n const title =`" + title + "`"
        t += "\n\n module.exports = {article, title}"
        // delete the file locally
        if(fs.existsSync(fileName)) fs.unlinkSync(fileName);
        fs.writeFileSync(fileName, t);
    }).catch(err => console.log(err))

    // await delay(1000);    // pause 1 second
}

const extractTextFromPdf = async (ws) => {
    let nbPdf = 0;
    let nbPdfConverted = 0;

    let ls = fs.readdirSync(srcDirPdf).filter(file => {
        const extension = path.extname(file);
        return extension === '.pdf';
    });
    nbPdf=ls.length;
    if (ws) ws.send(JSON.stringify({type: 'message', level: 'info', value: `${nbPdf} pdf files to convert...` }));

    const pallier = isPallier(30);

    for (const art of ls) {
        await writejs(art);
        nbPdfConverted++;
        const percentComplete = Math.min(Math.ceil((nbPdfConverted / nbPdf) * 100), 100);
        if(ws&&pallier(percentComplete)) ws.send(JSON.stringify({ type: 'progress', percentComplete: percentComplete }));
    }

    return nbPdfConverted;
}

module.exports = {extractTextFromPdf}

