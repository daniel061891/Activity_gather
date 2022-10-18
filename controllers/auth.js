const mongoose = require("mongoose");
const UserModel = require("../models/auth");
// Login
exports.getLogin = (req, res, next) => {
  res.render("login", { showErr: false });
};
exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const data = await UserModel.find({ email: email });
  console.log(data);
  if (data.length !== 0 && password === data[0].password) {
    req.session.user = {
      id: data[0]._id,
      email: email,
    };
    console.log("登入成功");
    res.redirect("/");
    return;
  }
  res.render("login", { errMsg: "信箱或密碼錯誤", showErr: true });
};

//register
exports.getRegister = (req, res, next) => {
  res.render("register", { showErr: false });
};

exports.postRegister = async (req, res, next) => {
  const { email, password, name, phone, checkPassword } = req.body;
  if (password !== checkPassword) {
    res.render("register", { errMsg: "密碼與確認密碼必須一致", showErr: true });
    return;
  }
  try {
    const data = await UserModel.create({
      email,
      password,
      name,
      phone,
    });
    // console.log(data);
    if (data) res.render("login", { showErr: false });
  } catch (err) {
    console.log(err);
  }
};

// logout
exports.getLogout = (req, res, next) => {
  req.session.user = undefined;
  res.render("login", { showErr: false });
};

// member center
exports.getMemberCenter = async (req, res, next) => {
  console.log("user", req.session.user);
  if (req.session.user === undefined) {
    res.render("404");
    return;
  }
  const userEmail = req.session.user.mail;
  try {
    const userData = await UserModel.find({ mail: userEmail });
    console.log(userData[0]);
    const { name, phone, email } = userData[0];
    res.render("member", {
      showAlert: false,
      showErr: false,
      name,
      phone,
      email,
    });
  } catch (err) {
    console.log(err);
  }
};

// postMemberCenter
exports.postMemberCenter = async (req, res, next) => {
  console.log(req.body);
  console.log(req.session.user);
  if (req.session.user === undefined) {
    res.render("404");
    return;
  }
  // const userEmail = req.session.user.email;
  const { name, phone, email, password, checkPassword } = req.body;
  if (password !== checkPassword) {
    res.render("member", {
      errMsg: "密碼與確認密碼必須一致",
      showErr: true,
      showAlert: false,
      name,
      phone,
      email,
    });
    return;
  }
  try {
    const id = req.session.user.id;
    console.log(id);
    let userData;
    if (password === "" && checkPassword === "") {
      userData = await UserModel.updateOne(
        { _id: id },
        {
          name,
          phone,
          email,
        }
      );
    } else {
      userData = await UserModel.updateOne(
        { _id: id },
        {
          name,
          phone,
          email,
          password,
        }
      );
    }
    console.log("userData", userData);
    // alert("修改成功");
    res.render("member", {
      showErr: false,
      showAlert: true,
      alertMsg: "修改成功",
      name,
      phone,
      email,
    });
  } catch (err) {
    console.log(err);
  }
};
