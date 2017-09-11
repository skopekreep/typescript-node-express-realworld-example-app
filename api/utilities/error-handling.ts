
import { Application } from 'express';

export function loadErrorHandlers(app: Application) {

	const isProduction = process.env.NODE_ENV === 'production';

	// catch 404 errors and forward to error handler
	app.use( (req, res, next) => {

		interface BetterError extends Error {
			status?: number;
		}

		const err: BetterError = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	// Dev error handler
	if (!isProduction) {
		app.use( (err, req, res, next) => {
			console.log(err.stack);

			res.status(err.status || 500);

			res.json({errors: {
				message: err.message,
				error: err
			}});
		});
	}

// Production error handler (no stack traces displayed)
	app.use( (err, req, res, next) => {

		res.status(err.status || 500);

		res.json({errors: {
			message: err.message,
			error: {}
		}});
	});

}
