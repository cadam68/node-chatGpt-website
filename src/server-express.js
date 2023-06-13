const express = require("express");
const path = require("path");
const hbs = require("hbs");
const notFoundRouter = require("./routers/404");
const appRouter = require("./routers/app");

const maintenanceMiddleware = require("./middlewares/maintenance");
const logMiddleware = require("./middlewares/log");

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Create the Express application
const app = express();

// Swagger configuration options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Pinecone-chatbot',
            version: '1.0.0',
            description: 'API documentation',
        },
    },
    apis: [path.join(__dirname, "/routers/*.js")], // Path to your API route files
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// --- configuring express ---
app.use(express.json()); // parse requests of content-type - application/json

// --- set static directory files ---
const publicDirectoryPath = path.join(__basedir, "/public");
app.use(express.static(publicDirectoryPath)); // Mounts the static files middleware function

// --- set express view engine to Handlebars ---
app.set("view engine", "hbs");
// --- set the location of the views directory (Handlebars default is /views)
app.set("views", path.join(__basedir, "/templates/views"));
// --- set the location of Handlebars partials
hbs.registerPartials(path.join(__basedir, "/templates/partials"));

// --- Middlewares ---
app.use(maintenanceMiddleware);
app.use(logMiddleware);

// --- add routes ---
app.use(appRouter);
app.use(notFoundRouter);

module.exports = app;
