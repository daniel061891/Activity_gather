const express = require("express");
const router = express.Router();

const activityController = require("../controllers/activity");

router.get("/add-activity", activityController.getaddActivity);
router.post("/add-activity", activityController.postaddActivity);

router.get("/my-activity", activityController.getmyActivity);

router.get("/activity-classify", activityController.getActivityClassify);

module.exports = router;
