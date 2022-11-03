const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  signUpActivityList: {
    type: Array
  },
  googleID: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now()
  },
  thumbnail: {
    type: String
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
