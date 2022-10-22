const mongoose = require("mongoose");
const UserModel = require("../models/auth");
// Login
exports.getLogin = (req, res, next) => {
  res.render("login", { showErr: false, isLogin: false });
};
exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const data = await UserModel.find({ email: email });
  console.log("login ok:", data);
  if (data.length !== 0 && password === data[0].password) {
    req.session.user = {
      id: data[0]._id,
      email: data[0].email,
    };
    console.log("登入成功");
    res.redirect("/");
    // res.render("index", { isLogin: true });
    return;
  }
  res.render("login", {
    errMsg: "信箱或密碼錯誤",
    showErr: true,
    isLogin: false,
  });
};

//register
exports.getRegister = (req, res, next) => {
  res.render("register", { showErr: false, isLogin: false });
};

exports.postRegister = async (req, res, next) => {
  const { email, password, name, phone, checkPassword } = req.body;
  if (password !== checkPassword) {
    res.render("register", {
      errMsg: "密碼與確認密碼必須一致",
      showErr: true,
      isLogin: false,
    });
    return;
  }
  const sameUserMail = await UserModel.findOne({ email: email });
  const sameUserPhone = await UserModel.findOne({ phone: phone });
  if (sameUserMail !== null || sameUserPhone !== null) {
    res.render("register", {
      showErr: true,
      errMsg: "此信箱或手機已被註冊",
      isLogin: false,
    });
    return;
  }
  try {
    const data = await UserModel.create({
      email,
      password,
      name,
      phone,
    });
    if (data) res.redirect("/login");
  } catch (err) {
    console.log(err);
  }
};

// logout
exports.getLogout = (req, res, next) => {
  req.session.user = undefined;
  res.redirect("/");
};

// member center
exports.getMemberCenter = async (req, res, next) => {
  console.log("user", req.session.user);
  if (req.session.user === undefined) {
    res.render("404", { isLogin: req.session.user ? true : false });
    return;
  }
  const id = req.session.user.id;
  try {
    const userData = await UserModel.find({ _id: id });
    console.log(userData[0]);
    const { name, phone, email } = userData[0];
    res.render("member", {
      showAlert: false,
      showErr: false,
      name,
      phone,
      email,
      isLogin: true,
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
    res.render("404", { isLogin: req.session.user ? true : false });
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
      isLogin: true,
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
      isLogin: true,
    });
  } catch (err) {
    console.log(err);
  }
};
