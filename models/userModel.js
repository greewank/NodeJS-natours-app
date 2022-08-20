const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// schema with 5 fields (name, email, photo, password, passwordConfirm)

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name of the user is not defined!'],
  },
  email: {
    type: String,
    required: [true, 'Email of the user is not given'],
    unique: true,
    lowercase: true, // Not a validator but this will convert into lowercase.
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  photo: String, //It's string because this is going to store only the path of the photo
  password: {
    type: String,
    required: [true, 'Define a password for the user!'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      // validator is only going to work on CREATE AND SAVE.
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords should be the same!',
    },
  },
});

// We're going to use document (pre-save) middleware for authentication which works in between getting the data and saving it to the database.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // going to use bcrypt hashing algorithm which will first salt(random string for protection) the password and hash it. (hash the password with cost of 12)
  this.password = await bcrypt.hash(this.password, 12);

  //   passwordConfirm is deleted because it was only required for validation and although it is required, required only for input but not persisted in the database.
  this.passwordConfirm = undefined;
  next();
});

// This is a instance method for checking hashed password and user password are same or not. Instance method is a method available on all the documents of a certain collection. Using the compare method from bcrypt to compare it.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// (Model variables should be capital letter). name of the model followed by the schema.
const User = mongoose.model('User', userSchema);

module.exports = User;