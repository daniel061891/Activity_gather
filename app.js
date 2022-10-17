const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");

const authRoutes = require("./router/auth");
// const erorrRoutes = require("./router/404");
// 設定ejs
app.set("view engine", "ejs");
app.set("views", "views");
// 管理靜態文件
app.use(express.static("public"));
// 接收post參數
app.use(express.urlencoded({ extended: false }));
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

// app.use((req, res, next) => {
//   if (req.session.user) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// });
const authCheck = (req, res, next) => {
  if (req.session.user) {
    req.session.date = Date.now();
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", authCheck, (req, res) => {
  res.render("index");
});

app.use(authRoutes);

// app.use(erorrRoutes);

app.get("*", (req, res) => {
  res.render("404");
  res.end();
});

mongoose
  .connect(
    "mongodb+srv://daniel:1996dan061891@cluster0.2hpkhk3.mongodb.net/?retryWrites=true&w=majority"
  )
  .then((result) => {
    console.log("Connected!");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
