const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      // This type and required are called schema options which is basically like additional description for a particular field (like here name, type, required).
      type: String,
      required: [true, 'Price of the tour is not defined.'],
      unique: true,
      trim: true,
      // Custom validator
      maxlength: [
        40,
        'A tour name must have less than or equal to 40 characters.',
      ],
      minlength: [
        10,
        'A tour name must have more than or equal to 10 characters.',
      ],
      //Custom validator used from validate (npm i validator)
      // validate: [validator.isAlpha, 'Tour name should only have characters.'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Tour must have a duration!'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour must have a group size!'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have a difficulty!'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty should be easy, medium or difficult!',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Ratings must be above 1'],
      max: [5, 'Ratings must be below 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      // This type of double condition in 'required' is called validation. and if the instance created from this schema doesn't follow this condition you'll get a validation error
      required: [true, 'Price of the tour is not defined.'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) is below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour must have a summary!'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image.'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTours: {
      type: Boolean,
      default: false,
    },
  },
  // Second object is for the option
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Fields we can define on our schema that will not be persisted are virtual properties. So not initially persisted in the database but will only be there as soon as we get it.
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE pre middleware (run before the event like .save() and .create(). runs only for these two methods and not for .update())
tourSchema.pre('save', function (next) {
  // So you will still be able to access and insert with the data before it is saved as in this case. this keyword will point out to the current document.
  this.slug = slugify(this.name, { lower: true });
  next();
});

// post middleware. So, save is the hook here and this will be called as 'post' 'save' middleware.
// tourSchema.post('save', function (doc, next) {
//   // there's no this keyword here but the saved document.
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  // this keyword will point out to the current query. ^find (regular expression) is all the strings that start with find.
  this.find({ secretTours: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTours: { $ne: true } } });
  next();
});

// Creating a model out of the schema (uppercase for name of the model)
// In the bracket here, name of the model is followed by the schema.
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
