const openai_lib = require("openai");
const pinecone = require("@pinecone-database/pinecone");
const {Configuration, OpenAIApi} = require("openai");
const path = require("path");
const { pineconeProperties } = require("../config/app.config");
const chalk = require("chalk");
let openai_api, index;

const init = async () => {
    openai_lib.api_key=pineconeProperties.openAiApiKey;

    const pine = new pinecone.PineconeClient()

    pine.projectName = pineconeProperties.projectName;
    pine.apiKey = pineconeProperties.pineConeApiKey;
    pine.environment = pineconeProperties.env;

    const p = await pine.init({
        apiKey: pineconeProperties.pineConeApiKey,
        environment: pineconeProperties.env,
    });
    const index = await pine.Index(pineconeProperties.index);

    const list = await pine.listIndexes()

    const configuration = new Configuration({
        // organization: "cadam68",       // iici
        apiKey: openai_lib.api_key,
    });

    const openai_api = new OpenAIApi(configuration);

    return {openai_api, index }

}

// Initialise OpenAI
(() => {
    init().then(r => {
        console.log(`${chalk.bold.inverse.green('ChatBot initialised...')}`);
        openai_api = r.openai_api;
        index = r.index;
    }).catch(err => {
        console.log(`${chalk.bold.inverse.red('ChatBot initialised fails!')}`);
        console.log(err);
        console.log('pinecone properties : '+JSON.stringify(pineconeProperties));
        process.exit(1);
    });
})();

const getOpenAPI = () => openai_api;
const getIndex = () => index;

module.exports = { getOpenAPI, getIndex }
