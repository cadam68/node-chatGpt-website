const fs = require('fs');
const path = require("path");
const { getOpenAPI, getIndex } = require('./initialize');
const { pineconeProperties } = require('./../config/app.config');
const srcDir = path.join(__basedir, "/data/articles_js/");

async function getAnswer(quest, ws) {
    let answer="Entschuldigung, ich bin nicht in der Lage, Ihre Frage zu beantworten.";

    try {
        if(ws) ws.send(JSON.stringify({ type: 'progress', percentComplete: 0 }));

        console.log("-----------------1")
        const xq = await getOpenAPI().createEmbedding({
            input: quest,
            model: "text-embedding-ada-002"
        })
        console.log("-----------------2")

        console.log("question emb:",xq)

        const question_emb = await xq.data.data[0]['embedding']
        console.log("-----------------3")

        const queryRequest = {
            vector: question_emb,
            topK: 1,
            includeMetadata: true,
            namespace: pineconeProperties.namespace,
        }

        console.log("QueryRequest:",queryRequest)
        console.log("-----------------4")

        const queryResp =await getIndex().query({queryRequest});

        console.log("queryResp:",queryResp)
        console.log("-----------------5")

        console.log(queryResp.matches[0].id)

        const fetchResponse = await getIndex().fetch({
            ids: [queryResp.matches[0].id],
            namespace: pineconeProperties.namespace,
        });

        console.log("title: " + fetchResponse.vectors[queryResp.matches[0].id].metadata.title)
        const targetContent = new String(fetchResponse.vectors[queryResp.matches[0].id].metadata.title).replaceAll(" ", "");

        if(ws) ws.send(JSON.stringify({ type: 'message', level : 'info', value:`identify the related article : ${targetContent}` }));
        if(ws) ws.send(JSON.stringify({ type: 'progress', percentComplete: 33 }));

        let dataContent =fs.readFileSync(srcDir+targetContent+'.js');
        const article = dataContent.toString().substring(0,5000);
        console.log(article);
        console.log(quest);

        if(ws) ws.send(JSON.stringify({ type: 'progress', percentComplete: 66 }));

        let response = await getOpenAPI().createChatCompletion({
            model:"gpt-3.5-turbo",
            messages:[
                { "role": "system", "content": "You are a polite assistant" },
                { "role": "assistant", "content": article},
                { "role": "user", "content": "Answer the following question: " + quest },
                { "role": "user", "content": "answer in french"}
            ],
            temperature:0,
            max_tokens:300
        })

        let choices = response.data.choices;
        answer = choices[0]['message']['content'];
        // console.log(choices[0]['message']['content'])
        if(ws) ws.send(JSON.stringify({ type: 'progress', percentComplete: 100 }));


    } catch (error) {
        console.error(error);
        if (error.response && error.response.status === 429) {
            // Rate limit exceeded
            const resetTime = parseInt(error.response.headers['retry-after'], 10) || 0;
            console.log(`--> Rate limit exceeded. Retrying after ${resetTime} seconds...`);
        }
    }

    return answer;
}

module.exports = {getAnswer}
