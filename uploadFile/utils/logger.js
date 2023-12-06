const winston = require("winston");
const { format } = require("logform");
require("winston-mongodb");
require("dotenv").config();

const alignedWithColorsAndTime = format.combine(
  format.prettyPrint(),
  format.metadata()
);

const loginLog = winston.createLogger({
  level: "error",
  format: alignedWithColorsAndTime,
  json: true,
  transports: [
    new winston.transports.MongoDB({
      db: process.env.URL,
      options: {
        useUnifiedTopology: true,
      },
      collection: "login_logs",
    }),
  ],
  exitOnError: false,
});

module.exports = { loginLog };
