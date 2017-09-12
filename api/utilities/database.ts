
import * as mongoose from 'mongoose';
import * as Bluebird from 'bluebird';


// Use bluebird promises in lieu of mongoose promises throughout application.
(mongoose as any).Promise = Bluebird;


export function connectToMongoDB() {

	const dbUri = 'mongodb://localhost:27017/conduit';

	mongoose.connect(dbUri, {
		useMongoClient: true
	});

	mongoose.set('debug', true);		// FIXME: Allow for dev only

	mongoose.connection.on('connected', () => {
		console.log('Mongoose connected to ' + dbUri);
	});

	mongoose.connection.on('disconnected', () => {
		console.log('Mongoose disconnected');
	});

	mongoose.connection.on('error', err => {
		console.log('Mongoose connection error: ' + err);
	});

// ADDITIONAL PROCESS EVENTS FOR UNIX MACHINES ONLY:

	// CTRL-C
	process.on('SIGINT', () => {
		mongoose.connection.close(() => {
			console.log('Mongoose disconnected through app termination (SIGINT)');
			process.exit(0);
		});
	});

	// Used on services on Heroku
	process.on('SIGTERM', () => {
		mongoose.connection.close(() => {
			console.log('Mongoose disconnected through app termination (SIGTERM)');
			process.exit(0);
		});
	});

	// Node restart
	process.once('SIGUSR2', () => {
		mongoose.connection.close(() => {
			console.log('Mongoose disconnected through app termination (SIGUSR2)');
			process.kill(process.pid, 'SIGUSR2');
		});
	});

}
