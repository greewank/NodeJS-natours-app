// File for setting our application
const mongoose = require('mongoose');
const dotenv = require('dotenv');
// console.log(process.env);

process.on('uncaughtException', (err) => {
  console.log('Unhandled Exception!!!!');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// getting the string from config.env file
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    // Deprication warnings, not too imp (for knowing).
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'));

// PRACTICE: testTour is an instance of the Tour model and we can use various methods on it that interacts with the database.
// const testTour = new Tour({
//   name: 'The Lake Swimmer',
//   price: 777,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('error', err);
//   });

// Starts up the server.
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening at port ${port}....`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection!!!!');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
