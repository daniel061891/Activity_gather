const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/is-auth')

const activityController = require("../controllers/activity");

router.get("/add-activity", isAuth, activityController.getaddActivity);
router.post("/add-activity", isAuth, activityController.postaddActivity);

router.get("/edit-activity/:id", isAuth, activityController.getEditActivity);
router.post("/edit-activity/:id", isAuth, activityController.postEditActivity);

router.get("/delete-activity/:id", isAuth, activityController.getDeleteActivity);

router.get("/my-activity", isAuth, activityController.getmyActivity);

router.get("/activity-classify", isAuth, activityController.getActivityClassify);

router.get("/activity-detail/:id", activityController.getActivityDetail);

router.get("/signup-activity/:id", isAuth, activityController.getSignUpActivity);
router.get("/signout-activity/:id", isAuth, activityController.getSignOutActivity);

router.get("/download/:id", isAuth, activityController.getImgDownload);

module.exports = router;
