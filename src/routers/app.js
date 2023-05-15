const express = require("express");
const router = new express.Router();
const { extractTextFromPdf } = require('../services/pdf-extract');
const { getContent } = require('../services/content-extract')
const { getAnswer } = require('../services/chatBot');
const { loadDBFn } = require('../services/loadDb');
const { hbsProperties } = require("../config/app.config");
const log4js = require("../services/log4j");
let logger = log4js.getLogger("app     ");
const { getWs } = require("../wss");

// --- Pages ---
router.get("", (req, res) => {
  logger.info(`access to 'main' page`);
  res.render("home", { ...hbsProperties, title: "Web site content extraction",
    subTitle: "Content Vectorize / Load on Pinecone" });
});

// --- contentExtract ---

async function checkUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

const processContentExtract = async (url, ws, res) => {
  const nbPdfGenerated = await getContent(url, ws);
  res.send({ nbPdfGenerated });
}

const contentExtract = async (query, res) => {
  // inexistent parameter
  if(!query.url) {
    return res.status(400).send({ error: 'You must provide requested data !' });
  }

  let ws = getWs(query.wsId);
  let url = decodeURI(query.url);

  // validate the url
  if(ws) ws.send(JSON.stringify({ type: 'message', level : 'info', value:`validation of the url...` }));

  const isValidUrl = await checkUrl(url);
  if (!isValidUrl) {
    return res.status(400).send({ error: `The url provided ${url} is not valid!` });
  }

  try {
    processContentExtract(url, ws, res).catch(error => {
      console.error(error);
      if(ws) ws.send(JSON.stringify({ type: 'error', message: 'Une erreur est survenue' }));
    });

  } catch(err) {
    res.send({ error: (err.message)?err.message:err })
  }
}

router.get("/contentExtract", ({query}, res) => {
  logger.info(`access by get to 'contentExtract' page with query=${JSON.stringify(query)}`);
  contentExtract(query, res);
});

// --- pdfExtract ---

const extractText = async (query, res) => {
  let ws = getWs(query.wsId);
  let nbPdfConverted = 0;

  try {
    nbPdfConverted = await extractTextFromPdf(ws);
  } catch(err) {
    res.send({ error: (err.message)?err.message:err })
  }
  res.send( { res: `Number of documents converted: ${nbPdfConverted}` });
}

router.get("/pdfExtract", ({query}, res) => {
  logger.info(`access by get to 'pdfExtract' page with query=${JSON.stringify(query)}`);
  extractText(query, res);
});

// --- loadDB ---

const loadDB = async (query, res) => {
  let ws = getWs(query.wsId);
  let nbFileUploaded = 0;

  try {
    nbFileUploaded = await loadDBFn(ws);
    console.log(`Number of documents uploaded: ${nbFileUploaded}`);
  } catch(err) {
    console.log(err);
    res.send({ error: (err.message)?err.message:err })
  }
  res.send( { res: `Number of documents uploaded: ${nbFileUploaded}`});
}

router.get("/loadDB", ({query}, res) => {
  logger.info(`access by get to 'loadDBFn' page with query=${JSON.stringify(query)}`);
  loadDB(query, res);
});

// --- chatBot ---

const processChatBot = async (question, ws, res) => {
  const answer = await getAnswer(question, ws);
  res.send({ answer });
}

const chatBot = async (query, res) => {
  // inexistent parameter
  if(!query.question) {
    return res.status(400).send({ error: 'You must provide requested data !' });
  }

  let ws = getWs(query.wsId);
  let question = decodeURI(query.question);

  try {
    processChatBot(question, ws, res).catch(error => {
      console.error(error);
      if(ws) ws.send(JSON.stringify({ type: 'error', message: 'Une erreur est survenue' }));
    });

  } catch(err) {
    res.send({ error: (err.message)?err.message:err })
  }
}

router.get("/chat", ({query}, res) => {
  logger.info(`access by get to 'contentExtract' page with query=${JSON.stringify(query)}`);
  chatBot(query, res);
});


module.exports = router;
