# ![RealWorld Example App](logo.png)

> ### Example Typescript Node (Typescript + Node + Express + Mongoose) codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.

### [Demo]()&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)

This codebase was created to demonstrate a fully fledged fullstack application built with Typescript Node including CRUD operations, authentication, routing, pagination, and more.

We've gone to great lengths to adhere to the Typescript Node community styleguides & best practices.

For more information on how to this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.


## Getting started

To get the Node server running locally:

- Clone this repo
- `npm install` to install all required dependencies
- Install MongoDB Community Edition ([instructions](https://docs.mongodb.com/manual/installation/#tutorials)) and run it by executing `mongod`
- Copy `.env.example` to `.env` and enter all variables.
- `npm run start` to start the local server.

## Application Structure

- `server.ts` - The entry point to our application.
- `app.ts` - This file defines our application and connects it to MongoDB using mongoose. It also requires the routes and models we'll be using in the application.
- `database/` - This folder contains he schema definitions for our Mongoose models and database connection code.
- `routes/` - This folder contains the route definitions for our API.
- `interfaces/` - This folder contains the interfaces for models
- `utilities/` - This folder contains the environment variables, passport authentication code, logger amd error handling logic.

## Error Handling

In `utilities/error-handling.ts`, we define all error-handling middleware for handling all server errors. It will respond with error-specific status code and format the response to have [error messages the clients can understand](https://github.com/gothinkster/realworld/blob/master/API.md#errors-and-status-codes)

## Authentication

Requests are authenticated using the `Authorization` header with a valid JWT. We define two express middlewares in `routes/auth.js` that can be used to authenticate requests. The `required` middleware configures the `express-jwt` middleware using our application's secret and will return a 401 status code if the request cannot be authenticated. The payload of the JWT can then be accessed from `req.payload` in the endpoint. The `optional` middleware configures the `express-jwt` in the same way as `required`, but will *not* return a 401 status code if the request cannot be authenticated.


<br />

