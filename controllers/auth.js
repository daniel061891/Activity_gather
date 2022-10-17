const UserModel = require("../models/auth");

// Login
exports.getLogin = (req, res, next) => {
  res.render("login", { showErr: false });
};
exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (email === "qwe@qwe" && password === "qwe") {
    req.session.user = {
      username: "daniel",
    };
    // res.setHeader("Set-Cookie", "isLogin=true");
    res.redirect("/");
    return;
  }
  res.render("login", { errMsg: "帳號或密碼錯誤", showErr: true });
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
    console.log(data);
    res.render("login", { showErr: false });
  } catch (err) {
    console.log(err);
  }
};

exports.getLogout = (req, res, next) => {
  req.session.user = undefined;
  res.render("login", { showErr: false });
};
