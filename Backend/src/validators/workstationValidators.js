const { body } = require("express-validator");

const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

const createWorkstationRules = [
  body("labRoomId")
    .isInt({ min: 1 })
    .withMessage("Valid lab room ID is required"),
  body("stationCode")
    .trim()
    .notEmpty()
    .withMessage("Station code is required")
    .isLength({ max: 50 }),
  body("ipAddress")
    .optional()
    .trim()
    .matches(IP_REGEX)
    .withMessage("Invalid IP address format"),
  body("macAddress")
    .optional()
    .trim()
    .matches(MAC_REGEX)
    .withMessage("Invalid MAC address format (e.g. AA:BB:CC:DD:EE:FF)"),
  body("ramGb")
    .optional()
    .isInt({ min: 1 })
    .withMessage("RAM must be a positive integer"),
];

const updateWorkstationRules = [
  body("stationCode").optional().trim().notEmpty().isLength({ max: 50 }),
  body("ipAddress")
    .optional()
    .trim()
    .matches(IP_REGEX)
    .withMessage("Invalid IP address"),
  body("macAddress")
    .optional()
    .trim()
    .matches(MAC_REGEX)
    .withMessage("Invalid MAC address"),
  body("ramGb")
    .optional()
    .isInt({ min: 1 })
    .withMessage("RAM must be a positive integer"),
];

const setStateRules = [
  body("state")
    .isIn(["available", "maintenance"])
    .withMessage("State must be available or maintenance"),
  body("force").optional().isBoolean().toBoolean(),
];

module.exports = {
  createWorkstationRules,
  updateWorkstationRules,
  setStateRules,
};
