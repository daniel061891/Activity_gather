const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  signUpActivityList: {
    type: Array
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
