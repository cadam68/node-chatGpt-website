const path = require("path");

module.exports = {
  filename: `${path.join(__dirname, "../../logs/")}pinecode.log`,
  level: "debug",    // debug, info
};
