const activityModel = require("../models/activity");
const UserModel = require("../models/auth");
const fs = require('fs')
const fileHelper = require('../util/file')
const io = require('../socket')

// Login
exports.getaddActivity = (req, res, next) => {
  res.render("addActivity", {
    showErr: false,
    user: req.session.user,
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
      name, type, place, imgUrl, desc, address, date, ownerId, createAt: Date.now()
    });
    // const activitys = await activityModel.find({})
    // io.getIO().emit('activitys', activitys);
    res.redirect("/my-activity");
  } catch (err) {
    console.log(err);
    res.render('404', {user: req.session.user, errMsg: '網路發生問題'})
  }
};
const ITEMS_OF_PAGE = 8
exports.getmyActivity = async(req, res, next) => {
  const ownerId = req.session.user.id
  let page = Number(req.query.page)
  if (!page) {
    page = 1
  }
  console.log(page);
  try {
    const activityData = await activityModel.find({ownerId: ownerId}).skip((page - 1) * ITEMS_OF_PAGE).limit(ITEMS_OF_PAGE).sort({createAt:-1}); 
    if (!activityData) {
      res.render('404', {user: req.session.user})
      const err = new Error('找不到此活動')
      throw err
    }
    const activityCount = await activityModel.find({ownerId: ownerId}).count()
    const pageInfo = {
      totalPage: Math.ceil(activityCount / ITEMS_OF_PAGE),
      hasPrePage: page === 1?false:true,
      hasNextPage: page === Math.ceil(activityCount / ITEMS_OF_PAGE)?false:true,
      page: page
    }
    res.render("myActivity", { user: req.session.user, activityData, pageInfo});
  } catch (err) {
    console.log(err);
  }
};

exports.getActivityClassify = (req, res, next) => {
  res.render("activityClassify", { user: req.session.user, });
};

exports.getActivityDetail = async(req, res, next) => {
  const activityId = req.query.id
  let userId = req.session.user? req.session.user.id : ''
  let showSignUpBtn
  try {
    const activityData = await activityModel.findOne({ _id: activityId})
    if (!activityData) {
      const err = new Error('404')
      throw err
    } 
    if (userId === '') {
      showSignUpBtn = true
      res.render("activityDetail", { user: req.session.user, activityData, showSignUpBtn});
      return
    }
    const isUserSignUp = activityData.signUpList.some(user => {
      return user.userId === userId
    })
    showSignUpBtn = !isUserSignUp
    res.render("activityDetail", { user: req.session.user, activityData, showSignUpBtn});
  } catch (err) {
    console.log(err);
    res.render('404', {user: req.session.user, errMsg: '找不到此頁面'})
  }
};

exports.getEditActivity = async(req, res, next) => {
  const activityId = req.params.id
  const activityData = await activityModel.findOne({ _id: activityId})
  res.render("editActivity", { showErr: false, user: req.session.user, activityData});
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
    res.redirect(`/activity-detail?id=${activityId}`)
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
    res.redirect(`/activity-detail?id=${activityId}`)
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

exports.postMsg = async(req, res) => {
  const userId = req.session.user.id
  const userName = req.session.user.name
  const { activity_id, msg, time} = req.body
  try {
    const activity = await activityModel.findOne({_id: activity_id})
    // console.log('前端傳來沒動過', time);
    // const sDate = new Date(time)
    // const hour = sDate.getHours().toString().length === 1 ? `0${sDate.getHours()}` : sDate.getHours()
    // const minute = sDate.getMinutes().toString().length === 1 ? `0${sDate.getMinutes()}` : sDate.getMinutes()
    // const newTime = `${sDate.getFullYear()}/${sDate.getMonth() + 1}/${sDate.getDate()}  ${hour}:${minute}`
    // console.log('newTime', newTime);
    activity.discuss.push({
      msg: msg,
      activity_id: activity_id,
      time: time,
      owner: {
        name: userName,
        id: userId,
      }
    })
    await activity.save()
    res.json({
      msg: msg,
      activity_id: activity_id,
      time: time,
      owner: {
        name: userName,
        id: userId,
      }
    })
    io.getIO().emit('msg', {
      msg: msg,
      activity_id: activity_id,
      time: time,
      owner: {
        name: userName,
        id: userId,
      }
    });
  } catch (err) {
    res.send('err')
    console.log(err);
  }
}

