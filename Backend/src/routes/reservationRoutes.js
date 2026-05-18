const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/reservationController");
const { auth, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  reserveLabRoomRules,
  reserveWorkstationRules,
  rejectRules,
} = require("../validators/reservationValidators");

router.get("/my", auth, ctrl.getMyReservations);

router.get(
  "/queue",
  auth,
  requireRole("lab_staff", "system_admin"),
  ctrl.getPendingQueue,
);

router.post(
  "/lab-room",
  auth,
  reserveLabRoomRules,
  validate,
  ctrl.reserveLabRoom,
);

router.post(
  "/workstation",
  auth,
  reserveWorkstationRules,
  validate,
  ctrl.reserveWorkstation,
);

router.get("/:id", auth, ctrl.getReservation);

router.patch("/:id/cancel", auth, ctrl.cancelReservation);

router.patch(
  "/:id/approve",
  auth,
  requireRole("lab_staff", "system_admin"),
  ctrl.approveReservation,
);

router.patch(
  "/:id/reject",
  auth,
  requireRole("lab_staff", "system_admin"),
  rejectRules,
  validate,
  ctrl.rejectReservation,
);

module.exports = router;
