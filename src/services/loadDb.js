const path = require("path");
const fs = require('fs');
const { getOpenAPI, getIndex } = require('./initialize');
const { pineconeProperties } = require('../config/app.config');

const srcDirJs = path.join(__basedir, "/data/articles_js/");

const loadOnDb = async (art, idx) => {

    const embedding_article = await getOpenAPI().createEmbedding({
        model: "text-embedding-ada-002",
        input: art.article
    })

    const vector = embedding_article.data.data[0]['embedding'];
    const v1 = {
        id: 'heureka-' + idx,
        values: vector,
        metadata: { title: art.title,
                    category: 'fire protection',
                    domain: 'insurances',
                    city: 'Bern', country:'Switzerland' }
    }

    const upsertRequest = {
        vectors: [ v1 ],
        namespace: pineconeProperties.namespace,
    }

    const response = await getIndex().upsert({upsertRequest})

}


const loadDBFn = async (ws) => {
    let ls = fs.readdirSync(srcDirJs).filter(file => {
        const extension = path.extname(file);
        return extension === '.js';
    }).slice(0, 40);    // limit during development phase

    let nbJSUploaded=0;
    const nbJS=ls.length;
    if (ws) ws.send(JSON.stringify({type: 'message', level: 'info', value: `${nbJS} files to upload in pinecone...` }));

    for (const art of ls.map(f => srcDirJs + f)
        .map(f => require(f))) {
        const idx = ls.map(f => srcDirJs + f).map(f => require(f)).indexOf(art);
        await loadOnDb(art, idx + 1);
        nbJSUploaded++;
        const percentComplete = Math.min(Math.ceil((nbJSUploaded / nbJS) * 100), 100);
        if(ws) ws.send(JSON.stringify({ type: 'progress', percentComplete: percentComplete }));
    }
    return ls.length;
}

module.exports = { loadDBFn }





