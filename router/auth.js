const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/logout", authController.getLogout);

router.get("/membercenter", authController.getMemberCenter);

router.post("/membercenter", authController.postMemberCenter);

module.exports = router;
