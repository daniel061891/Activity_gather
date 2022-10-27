const activityModel = require("../models/activity");
// Login
exports.getaddActivity = (req, res, next) => {
  res.render("addActivity", {
    showErr: false,
    isLogin: req.session.user ? true : false,
  });
};
exports.postaddActivity = async(req, res, next) => {
  const { name, type, place, desc, address, date } = req.body
  const img = req.file
  const imgUrl = img.path
  const ownerId = req.session.user.id
  try {
    await activityModel.create({
      name, type, place, imgUrl, desc, address, date, ownerId
    });
    res.redirect("/my-activity");
  } catch (err) {
    console.log(err);
  }
};

exports.getmyActivity = async(req, res, next) => {
  const ownerId = req.session.user.id
  try {
    const activityData = await activityModel.find({ ownerId: ownerId });
    res.render("myActivity", { isLogin: req.session.user ? true : false, activityData });
  } catch (err) {
    console.log(err);
  }
};

exports.getActivityClassify = (req, res, next) => {
  res.render("activityClassify", { isLogin: req.session.user ? true : false, });
};

exports.getActivityDetail = async(req, res, next) => {
  const activityId = req.params.id
  const activityData = await activityModel.findOne({ _id: activityId})
  console.log(activityData);
  res.render("activityDetail", { isLogin: req.session.user ? true : false, activityData});
};

exports.getEditActivity = async(req, res, next) => {
  const activityId = req.params.id
  const activityData = await activityModel.findOne({ _id: activityId})
  res.render("editActivity", { showErr: false, isLogin: req.session.user ? true : false, activityData});
};

exports.postEditActivity = async(req, res, next) => {
  const activityId = req.params.id
  const { name, type, place, desc, address, date } = req.body
  const img = req.file
  const imgUrl = img.path
  try {
    const activity = await activityModel.findOne({ _id: activityId})
    if (activity.ownerId !== req.session.user.id) return res.redirect('/')
    await activityModel.updateOne({ _id: activityId}, { name, type, place, imgUrl, desc, address, date })
    res.redirect('/my-activity')
  } catch (err) {
    console.log(err);
  }
};
exports.getDeleteActivity = async(req, res, next) => {
  const activityId = req.params.id;
  try {
    const activity = await activityModel.findOne({ _id: activityId})
    if (activity.ownerId !== req.session.user.id) return res.redirect('/')
    await activityModel.deleteOne({ _id: activityId})
    res.redirect('/my-activity')
  } catch (err) {
    console.log(err);
  }
};
