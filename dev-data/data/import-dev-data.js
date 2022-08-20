//Script that will load the tours-simple.json into the mongoDB database
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

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

//   Reading the json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`));

// Importing data into database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded.');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// For deleting all data from the database
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
