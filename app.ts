
import * as express from 'express';
import { Application } from 'express';
import * as bodyParser from 'body-parser';
import { MainRouter } from './api/routes/index';
import { connectToMongoDB } from './api/utilities/database';
import { loadErrorHandlers } from './api/utilities/error-handling';
import './api/utilities/passport';
// FIXME: Sort out passport stuff...
// import * as passport from 'passport';
import * as session from 'express-session';


const app: Application = express();


connectToMongoDB();

app.use(bodyParser.json());
app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
// app.use(passport.initialize());
// app.use(passport.session());
app.use('/api', MainRouter);

loadErrorHandlers(app);


const server = app.listen( 3000, () => {
	console.log('Listening on port ' + server.address().port);
});
