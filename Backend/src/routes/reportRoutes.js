const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reportController");
const { auth, requireRole } = require("../middlewares/auth");

router.get("/", auth, requireRole("system_admin"), ctrl.generateReport);

module.exports = router;
