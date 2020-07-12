import mongoose from 'mongoose';
import logger from "../utilities/logger";
import { DB } from "../utilities/secrets";

// Build the connection string
const dbURI = `mongodb://${DB.USER}:${encodeURIComponent(DB.PASSWORD)}@${DB.HOST}:${DB.PORT}/${
  DB.NAME
}`;

const options = {
  useNewUrlParser   : true,
  useCreateIndex    : true,
  useUnifiedTopology: true,
  useFindAndModify  : false,
  autoIndex         : true,
  poolSize          : 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries  : 0,
  connectTimeoutMS  : 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS   : 45000, // Close sockets after 45 seconds of inactivity
};

logger.debug(dbURI);

// Create the database connection
mongoose
  .connect(dbURI, options)
  .then(() => {
    logger.info('Mongoose connection done');
  })
  .catch((e) => {
    logger.info('Mongoose connection error');
    logger.error(e);
  });

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', () => {
  logger.info('Mongoose default connection open to ' + dbURI);
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  logger.error('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  logger.info('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    logger.info('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
