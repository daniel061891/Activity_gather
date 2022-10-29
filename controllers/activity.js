const activityModel = require("../models/activity");
const UserModel = require("../models/auth");
const fs = require('fs')
const path = require('path')
const fileHelper = require('../util/file')
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
  let imgUrl
  if (img) {
    imgUrl = img.path
  }
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
  let userId = req.session.user? req.session.user.id : ''
  let showSignUpBtn
  try {
    const activityData = await activityModel.findOne({ _id: activityId})
    if (userId === '') {
      showSignUpBtn = true
      res.render("activityDetail", { isLogin: req.session.user ? true : false, activityData, showSignUpBtn});
      return
    }
    const isUserSignUp = activityData.signUpList.some(user => {
      return user.userId === userId
    })
    showSignUpBtn = !isUserSignUp
    res.render("activityDetail", { isLogin: req.session.user ? true : false, activityData, showSignUpBtn});
  } catch (err) {
    console.log(err);
  }
  
  // if (userId === '') {
  //   showSignUpBtn = true
  // } else {
    
  // }
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
  console.log('img', img);
  let imgUrl
  try {
    const activity = await activityModel.findOne({ _id: activityId})
    if (activity.ownerId !== req.session.user.id) return res.redirect('/')
    if (img) {
      if (activity.imgUrl) {
        fileHelper.deleteFile(activity.imgUrl)
      }
      console.log('activity.imgUrl', activity.imgUrl);
      imgUrl = img.path
    } else {
      imgUrl = activity.imgUrl
    }
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
    if(activity.imgUrl) {
      fileHelper.deleteFile(activity.imgUrl)
    }
    await activityModel.deleteOne({ _id: activityId})
    res.redirect('/my-activity')
  } catch (err) {
    console.log(err);
  }
};

exports.getSignUpActivity = async(req, res, next) => {
  const activityId = req.params.id;
  const userId = req.session.user.id;
  try {
    const activity = await activityModel.findOne({ _id: activityId})
    const user = await UserModel.findOne({_id: userId})
    const signUpData = {
      userId: userId,
      userName: user.name
    }
    activity.signUpList.push(signUpData)
    user.signUpActivityList.push(activityId)
    await activity.save()
    await user.save()
    res.redirect(`/activity-detail/${activityId}`)
  } catch (err) {
    console.log(err);
  }
};

exports.getSignOutActivity = async(req, res, next) => {
  const activityId = req.params.id;
  const userId = req.session.user.id;
  try {
    const activity = await activityModel.findOne({ _id: activityId})
    const user = await UserModel.findOne({_id: userId})
    activity.signUpList = activity.signUpList.filter(userData => {
      return userData.userId !== userId 
    })
    user.signUpActivityList = user.signUpActivityList.filter(id => {
      return id !== activityId 
    })
    await activity.save()
    await user.save()
    res.redirect(`/activity-detail/${activityId}`)
  } catch (err) {
    console.log(err);
  }
}

exports.getImgDownload = async (req, res, next) => {
  const activityId = req.params.id
  const activity = await activityModel.findOne({_id: activityId})
  fs.readFile(activity.imgUrl, (err, data) => {
    if (err) {
      return next(err)
    }
    res.setHeader('Content-Type','application/jpeg')
    res.setHeader('Content-Disposition', 'attachment; filename="image.jpg"')
    res.send(data)
  })
}