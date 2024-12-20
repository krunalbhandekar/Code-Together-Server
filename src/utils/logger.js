import pino from "pino";

const pinoLogger = pino();
const logger = {
  info: function (...args) {
    pinoLogger.info(JSON.stringify(args));
  },
  error: function (...args) {
    pinoLogger.error(JSON.stringify(args));
  },
};

export default logger;
