import { addColors, createLogger, format, transports } from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

addColors(colors);

const customFormat = format.printf(({ timestamp, level, message, stack }) => {
  if (stack) {
    return `${timestamp} ${level}: ${message}\n\n\x1b[31m${stack}\x1b[0m\n`;
  }

  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  level: "http",
  levels,
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.colorize({ all: true }),
    customFormat
  ),
  transports: [
    new transports.File({ filename: "error.log", level: "error" }), // Log errors to a file
    new transports.File({ filename: "combined.log" }), // Combined log for all levels
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.errors({ stack: true }),
        format.colorize({ all: true }),
        customFormat
      ),
    })
  );
}

export default logger;
