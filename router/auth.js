const express = require("express");
const router = express.Router();
const passport = require('passport')

const authController = require("../controllers/auth");

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/logout", authController.getLogout);

router.get("/membercenter", authController.getMemberCenter);

router.post("/membercenter", authController.postMemberCenter);

router.get("/forget-password", authController.getForgetPassword);
router.post("/forget-password", authController.postForgetPassword);

router.get("/reset/:token", authController.getReset);
router.post("/reset", authController.postReset);

router.get("/auth/google", passport.authenticate('google', { scope: ['profile'] }));
router.get('/auth/google/redirect', 
  passport.authenticate('google', { failureRedirect: '/login', session: false}),
  (req, res) => {
    req.session.user = {
      id: req.user._id,
      email: req.user.email || '',
      name: req.user.name
    };
    res.redirect('/');
  });

module.exports = router;
