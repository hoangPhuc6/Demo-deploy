const { body } = require("express-validator");

const createLabRoomRules = [
  body("roomCode")
    .trim()
    .notEmpty()
    .withMessage("Room code is required")
    .isLength({ max: 50 })
    .withMessage("Room code too long"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Room name is required")
    .isLength({ max: 150 })
    .withMessage("Room name too long"),
  body("capacity")
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer"),
  body("location").optional().trim().isLength({ max: 255 }),
  body("description").optional().trim(),
];

const updateLabRoomRules = [
  body("name").optional().trim().notEmpty().isLength({ max: 150 }),
  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer"),
  body("location").optional().trim().isLength({ max: 255 }),
  body("status")
    .optional()
    .isIn(["active", "maintenance", "decommissioned"])
    .withMessage("Invalid status"),
];

module.exports = { createLabRoomRules, updateLabRoomRules };
