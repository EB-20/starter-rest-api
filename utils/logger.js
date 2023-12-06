// const winston = require("winston");
// const { format } = require("logform");
// require("winston-mongodb");
const winston = require('winston');
const { createLogger, format, transports } = winston;
require("dotenv").config();

const log  = ()=>{
  const logger = createLogger({
    level: 'info',
    format: format.combine(
      format.colorize(),
      format.simple()
    ),
    transports: [
      new transports.Console()
    ]
  })
  logger.info('log');
}

module.exports = log