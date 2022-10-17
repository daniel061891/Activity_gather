const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const UserType = {
  name: String,
  phone: String,
  email: String,
  password: String,
};

const UserModel = mongoose.model("users", new Schema(UserType));

module.exports = UserModel;
