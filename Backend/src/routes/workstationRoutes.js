const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/workstationController");
const { auth, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  createWorkstationRules,
  updateWorkstationRules,
  setStateRules,
} = require("../validators/workstationValidators");

router.get("/", auth, ctrl.listWorkstations);

router.get("/:id", auth, ctrl.getWorkstation);

router.post(
  "/",
  auth,
  requireRole("system_admin"),
  createWorkstationRules,
  validate,
  ctrl.createWorkstation,
);

router.put(
  "/:id",
  auth,
  requireRole("system_admin"),
  updateWorkstationRules,
  validate,
  ctrl.updateWorkstation,
);

router.patch(
  "/:id/state",
  auth,
  requireRole("lab_staff", "system_admin"),
  setStateRules,
  validate,
  ctrl.setWorkstationState,
);

router.delete(
  "/:id",
  auth,
  requireRole("system_admin"),
  ctrl.deleteWorkstation,
);

module.exports = router;
