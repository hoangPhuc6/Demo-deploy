const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/labRoomController");
const { auth, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  createLabRoomRules,
  updateLabRoomRules,
} = require("../validators/labRoomValidators");

router.get("/", auth, ctrl.listLabRooms);

router.get("/:id", auth, ctrl.getLabRoom);

router.post(
  "/",
  auth,
  requireRole("system_admin"),
  createLabRoomRules,
  validate,
  ctrl.createLabRoom,
);

router.put(
  "/:id",
  auth,
  requireRole("system_admin"),
  updateLabRoomRules,
  validate,
  ctrl.updateLabRoom,
);

router.delete("/:id", auth, requireRole("system_admin"), ctrl.deleteLabRoom);

module.exports = router;
