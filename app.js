const express = require("express");
const app = express();
const mongoose = require("mongoose");
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

app.get("/", (req, res) => {
  res.render("index");
});

app.use(authRoutes);

// app.use(erorrRoutes);

app.get("*", (req, res) => {
  res.render('404')
  res.end();
});

app.listen(3000, () => {
  console.log("server start!!");
});