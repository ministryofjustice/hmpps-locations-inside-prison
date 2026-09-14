import winston from 'winston'
import config from './server/config'

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.colorize({ all: !config.production }),
    winston.format.timestamp(),
    winston.format.simple(),
  ),
  defaultMeta: { service: 'Residential locations' },
  transports: [
    new winston.transports.Console({
      // handleExceptions: true,
    }),
  ],
})

export default logger
