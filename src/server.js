const chalk = require("chalk");
const pathParse = require("path-parse");
const yargs = require("yargs")(process.argv.slice(2));
const path = require("path");

// -- definition of global settings --
global.__basedir = path.join(__dirname, "..");

// console.log('__dirname : '+__dirname);
// console.log('__basedir : '+__basedir);
// console.log('__filename : '+__filename);

const { appProperties } = require("./config/app.config");

// === yargs settings ===
yargs
  .option("port", {
    alias: "p",
    demandOption: false,
    default: appProperties.portDefault,
    describe: "The port were the server is listening",
    type: "number",
    nargs: 1,
  })
  .version("1.0.0")
  .help()
  .usage("Usage: $0 -p port")
  .example(
    `$0 -p ${appProperties.portDefault}`,
    `: Start the server on port ${appProperties.portDefault}`
  );
const argv = yargs.argv;

const port = Number(process.env.PORT || argv.port);
const app = require("./app");
const wss = require("./wss");
wss.init(port+1);

// === starting the server ===
app.listen(port, () => {
  console.log(
    `${chalk.bold.inverse.green(
      " Success "
    )} : Server is up at http://localhost:${port}`
  );
  console.log(`> See more options : ${pathParse(argv["$0"]).base} --help`);
});
