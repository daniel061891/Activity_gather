const activityModel = require("../models/activity");
// Login
exports.getaddActivity = (req, res, next) => {
  res.render("addActivity", {
    showErr: false,
    isLogin: req.session.user ? true : false,
  });
};
exports.postaddActivity = (req, res, next) => {
  res.redirect("/my-activity");
};

exports.getmyActivity = (req, res, next) => {
  res.render("myActivity", { isLogin: req.session.user ? true : false });
};

exports.getActivityClassify = (req, res, next) => {
  res.render("activityClassify", { isLogin: req.session.user ? true : false });
};
