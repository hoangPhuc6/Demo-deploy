const { body } = require("express-validator");

const reserveLabRoomRules = [
  body("labRoomId")
    .isInt({ min: 1 })
    .withMessage("Valid lab room ID is required"),
  body("startTime")
    .isISO8601()
    .withMessage("startTime must be a valid ISO 8601 datetime"),
  body("endTime")
    .isISO8601()
    .withMessage("endTime must be a valid ISO 8601 datetime"),
  body("purpose").optional().trim().isLength({ max: 500 }),
  body("expectedUsers").optional().isInt({ min: 1 }),
];

const reserveWorkstationRules = [
  body("workstationId")
    .isInt({ min: 1 })
    .withMessage("Valid workstation ID is required"),
  body("startTime")
    .isISO8601()
    .withMessage("startTime must be a valid ISO 8601 datetime"),
  body("endTime")
    .isISO8601()
    .withMessage("endTime must be a valid ISO 8601 datetime"),
];

const rejectRules = [
  body("reason").trim().notEmpty().withMessage("Rejection reason is required"),
];

module.exports = { reserveLabRoomRules, reserveWorkstationRules, rejectRules };
