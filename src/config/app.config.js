const path = require('path'); 
const { env } = require('yargs');
require("dotenv").config({ path: path.join(__dirname, "../../config/process.env"), debug: true, override: true });

const appProperties = {
    portDefault : 3500,
    maintenanceMode : false,
}

const hbsProperties = { 
    author: 'Cyril Adam',
    version: '1.0.0' 
}

const pineconeProperties = {
    env: 'us-west1-gcp-free',
    namespace: 'example-namespace',
    projectName: 'test',
    index: 'article-index',
    openAiApiKey: process.env.OPENAI_APIKEY,
    pineConeApiKey : process.env.PINECONE_APIKEY,
}

module.exports = { appProperties, hbsProperties, pineconeProperties }
