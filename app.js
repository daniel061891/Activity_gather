const express = require("express");
const app = express();
const mongoose = require("mongoose");

const session = require("express-session");
const multer = require('multer')

const authRoutes = require("./router/auth");
const activityRoutes = require("./router/activity")

const activityModel = require("./models/activity");

// 設定ejs
app.set("view engine", "ejs");
app.set("views", "views");
// 管理靜態文件
app.use(express.static("public"));
app.use('/images', express.static("images"));
// 接收post參數
app.use(express.urlencoded({ extended: false }));
// 控制接到的檔案要存在哪裡、檔名如何命名
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
app.use(multer({ storage: fileStorage }).single('img'))
// 接收JSON參數
app.use(express.json());

// 註冊session middleware
app.use(
  session({
    name: "danielSystem",
    secret: "danielAG",
    cookie: {
      maxAge: 1000 * 60 * 60,
      secure: false,
    },
    resave: true,
    saveUninitialized: true,
  })
);

app.get("/", async(req, res) => {
  try {
    const activityData = await activityModel.find({})
    res.render("index", { isLogin: req.session.user ? true : false, activityData});
  } catch (err) {
    console.log(err);
  }
});

app.use(authRoutes);
app.use(activityRoutes);

app.get("*", (req, res) => {
  res.render("404", { isLogin: req.session.user ? true : false });
  res.end();
});

mongoose
  .connect(
    "mongodb+srv://daniel:1998mongo0618@cluster0.2hpkhk3.mongodb.net/?retryWrites=true&w=majority"
  )
  .then((result) => {
    console.log("Connected!");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
