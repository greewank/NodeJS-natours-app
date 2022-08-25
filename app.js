const express = require('express');
// const { application } = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express(); //Is going to include express in the app variable.

// GLOBAL MIDDLEWARE
// console.log(process.send.NODE_ENV);
// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this ip. Please try again in an hour.',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '50kb' })); //Use of middleware (function that can modify the incoming request data) which is express.json in this case. 'use' method is going to use/create the middleware here.

// Data sanitization against NOSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS(Cross-site) scripting attacks
app.use(xss());

// Serving static files
app.use(express.static(`${__dirname}/public`)); //Use of middleware for static files so the files which don't go into any route but simply serve the file we specified from the public folder (files that we can't access from the routes we created).

// Creating our own middleware:
// Use of next specifies that this is a middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTE HANDLERS...
// Defining a route. Routing means how an application responds to a certain client request(URL and HTTP method used for the request).
// app.get('/', (req, res) => {
//   res.status(404).json({ message: 'Hello from the server.', app: 'Natours' });
//   //   The content type of the response object will automatically be 'applications/json' when you use the json method because of express.
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this endpoint...');
// });

// ROUTES

// ...........////////........

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// ***********/////////********/

// This tourRouter and userRouter need to be connected to the application which is why we will use it as a middleware (connecting between tour resource and the app).
// This process is called mounting a router on a route.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Route handler when route is not handled by any of the routers.
// .all will run for all the http methods.
// This will work when a false url is input because it means that at this point the request-response cycle didn't complete so, the aboe tourRouter or userRouter didn't work.
app.all('*', (req, res, next) => {
  // Creating an instance called err in the built in Error object in express.
  // const err = new Error(`Can't find ${req.originalUrl} on this server... `);
  // err.status = 'fail';
  // err.statusCode = 404;

  // if we pass something in the next express is going to detect it as an error.
  next(new AppError(`Can't find ${req.originalUrl} on this server... `, 404));
});

// Global Error handling middleware
app.use(globalErrorHandler);
module.exports = app;
