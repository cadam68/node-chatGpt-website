import { ExtractPdfView } from "./extractPdf.js";
import { ChatBotView } from "./chatBot.js";
import { CallApiView } from './callApi.js';
import { stepsController } from './steps.js'

stepsController.register("btn-extractPdf","section-extractPdf", 1);
stepsController.register("btn-pdfToJs","section-pdfToJs", 1);
stepsController.register("btn-loadDB","section-loadDB", 1);
stepsController.register("btn-chat","section-chat", 2);
stepsController.activate("btn-extractPdf");
stepsController.activate("btn-chat");

const extractInputEL= document.getElementById("input-url");
const extractFormEL = document.getElementById('submit-extract');
const extractResultLabel = document.getElementById('results-extract-label');
const extractResult = document.getElementById('results-extract-number');
const extractProgressBtn = document.getElementById('btn-submit-extract');

ExtractPdfView(extractInputEL, extractFormEL, extractResultLabel, extractResult, extractProgressBtn, () => stepsController.activate("btn-pdfToJs"));

const pdfToJSResult = document.getElementById('results-pdfExtract');
const pdfToJSProgressBtn = document.getElementById('btn-submit-pdfExtract');

CallApiView(pdfToJSResult, pdfToJSProgressBtn, 'pdfExtract', () => stepsController.activate("btn-loadDB"));

const loadDBResult = document.getElementById('results-loadDB');
const loadDBProgressBtn = document.getElementById('btn-submit-loadDB');

CallApiView(loadDBResult, loadDBProgressBtn, 'loadDB', () => stepsController.activate("btn-extractPdf"));

const chatInputEL= document.getElementById("input-text");
const chatFormEL = document.getElementById('submit-chat');
const chatProgressBtn = document.getElementById('btn-submit-chat');
const questionTemplate  = document.querySelector('#question-template').innerHTML;
const answerTemplate  = document.querySelector('#answer-template').innerHTML;
const messagesEL = document.getElementById('messages');

ChatBotView(chatInputEL, chatFormEL, chatProgressBtn, messagesEL, questionTemplate, answerTemplate);

