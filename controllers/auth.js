const UserModel = require("../models/auth");
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: 'daniel061891@gmail.com',
    pass: 'vmnacsnmlarhciao',
  },
});
// Login
exports.getLogin = (req, res, next) => {
  res.render("login", { showErr: false, isLogin: false });
};
exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const data = await UserModel.find({ email: email });
    const comparePassword = await bcrypt.compare(password, data[0].password)
    console.log(comparePassword);
    if (data.length !== 0 && comparePassword ) {
      req.session.user = {
        id: data[0]._id,
        email: data[0].email,
      };
      console.log("登入成功");
      res.redirect("/");
      return;
    }
    res.render("login", {
      errMsg: "信箱或密碼錯誤",
      showErr: true,
      isLogin: false,
    });
  } catch (err) {
    console.log(err);
  }
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
    const hashPassword = await bcrypt.hash(password, 12)
    const data = await UserModel.create({
      email,
      password: hashPassword,
      name,
      phone,
    });
    if (data) {
      transporter.sendMail({
        from: 'daniel061891@gmail.com',
        to: email,
        subject: '註冊成功',
        html: '<h1>恭喜您註冊成功!</h1>',
      }).then(info => {
        console.log('info', { info });
        res.redirect("/login");
      }).catch(console.error);
    }
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
  if (req.session.user === undefined) {
    res.render("404", { isLogin: req.session.user ? true : false });
    return;
  }
  const id = req.session.user.id;
  try {
    const userData = await UserModel.find({ _id: id });
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

exports.getForgetPassword = async(req, res) => {
  res.render("forgetPassword", { isLogin: req.session.user ? true : false, showErr: false});
}

exports.postForgetPassword = async(req, res) => {
  crypto.randomBytes(32, async(err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/forget-password')
    }
    const token = buffer.toString('hex')
    const { email } = req.body
    try {
      const user = await UserModel.findOne({email: email})
      if (!user) {
        res.render("forgetPassword", { isLogin: req.session.user ? true : false, showErr: true, errMsg: '查無此信箱'});
        return
      }
      user.resetToken = token
      user.resetTokenExpiration = Date.now() + 3600000
      await user.save()
      const sendEmailInfo = await transporter.sendMail({
        from: 'daniel061891@gmail.com',
        to: email,
        subject: '重設密碼',
        html: `
          <a href="http://localhost:3000/reset/${token}">點擊此連結重設密碼</a>
        `,
      })
      console.log('sendEmailInfo', sendEmailInfo);
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  })
  // res.render("forgetPassword", { isLogin: req.session.user ? true : false, showErr: false});
}

exports.getReset = async(req, res) => {
  try {
    const { token } = req.params
    const user = await UserModel.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    if (user) {
      const userId = user._id.toString()
      res.render("reset", { isLogin: req.session.user ? true : false, showErr: false, userId, resetToken: user.resetToken });
    }
  } catch (err) {
    console.log(err);
  }
}

exports.postReset = async(req, res) => {
  try {
    const { password, checkPassword, userId, resetToken } = req.body
    if (password !== checkPassword) {
      res.render("reset", { isLogin: req.session.user ? true : false, showErr: true, errMsg: '密碼與密碼確認必須一致'});
      return
    }
    console.log(userId, resetToken);
    const user = await UserModel.findOne({ _id: userId, resetToken: resetToken, resetTokenExpiration: {$gt: Date.now()}})
    const hashPassword = await bcrypt.hash(password, 12)
    user.password = hashPassword
    user.resetToken = undefined
    user.resetTokenExpiration = undefined
    await user.save()
    res.redirect("/login")
  } catch (err) {
    console.log(err);
  }
}


