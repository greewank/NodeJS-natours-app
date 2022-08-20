class APIfeatures {
  // query is from Mongoose query(Tour.find() method) and queryString(req.query) is from Express
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // Building a query
    // 1A.FILTERING
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'fields', 'limit'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B. ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    // We use regular expressions
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));

    // Tour.find is going to return a query of the result
    // let query = Tour.find(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));

    return this; //returning the entire object
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy);
      // sort('price ratingsAverage')
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this; //returning the entire object
  }

  limitFields() {
    // 3. FIELD LIMITING (Allowing the clients to choose which field they want to get in the response)
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    // 4.PAGINATION
    // skip is the amount of results that should be skipped before querying the data. limit is the amount of data to be limited.
    const page = this.queryString.page * 1 || 1; //a trick for converting string to a number.
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIfeatures;
