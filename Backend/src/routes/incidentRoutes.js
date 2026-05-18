const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/incidentController");
const { auth, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const {
  createTicketRules,
  updateStatusRules,
} = require("../validators/incidentValidators");

router.post("/", auth, createTicketRules, validate, ctrl.createTicket);

router.get(
  "/",
  auth,
  requireRole("lab_staff", "system_admin"),
  ctrl.listTickets,
);

router.get("/:id", auth, ctrl.getTicket);

router.patch(
  "/:id/status",
  auth,
  requireRole("lab_staff", "system_admin"),
  updateStatusRules,
  validate,
  ctrl.updateTicketStatus,
);

module.exports = router;
