import { Application, Request, Response } from 'express';
import { IS_PRODUCTION } from "./secrets";
import logger from "./logger";

export function loadErrorHandlers(app: Application) {

  // catch 404 errors and forward to error handler
  app.use((req, res, next) => {

    interface BetterError extends Error {
      status?: number;
    }

    const err: BetterError = new Error('Not Found');
    err.status             = 404;
    next(err);
  });

  app.use((err: any, req: Request, res: Response, next: any) => {

    if (err.name === 'ValidationError') {
      return res.status(422).json({
        errors: Object.keys(err.errors).reduce(function (errors: any, key: string) {
          errors[key] = err.errors[key].message;

          return errors;
        }, {})
      });
    }

    logger.error(err);
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        error  : !IS_PRODUCTION ? err : {}
      }
    });
  });

}
