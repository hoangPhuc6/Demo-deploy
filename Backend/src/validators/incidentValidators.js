const { body } = require("express-validator");

const createTicketRules = [
  body("category")
    .isIn(["hardware", "network", "os", "software"])
    .withMessage("Category must be one of: hardware, network, os, software"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 2000 }),
  body("workstationId").optional().isInt({ min: 1 }),
  body("labRoomId").optional().isInt({ min: 1 }),
];

const updateStatusRules = [
  body("status")
    .isIn(["open", "under_review", "resolved", "closed"])
    .withMessage("Invalid status"),
  body("resolutionNote").optional().trim().isLength({ max: 2000 }),
];

module.exports = { createTicketRules, updateStatusRules };
