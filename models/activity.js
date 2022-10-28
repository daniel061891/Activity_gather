const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const activitySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  place: {
    type: String,
    required: true,
  },
  signUpList: {
    type: Array,
    // required: true,
  },
  imgUrl: {
    type: String
  },
  desc: {
    type: String,
    required: true,
  },
  ownerId: {
    type: String,
    require: true,
  }
});

const activityModel = mongoose.model("activitys", activitySchema);

module.exports = activityModel;
