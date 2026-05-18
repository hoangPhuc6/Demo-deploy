const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/userController");
const { auth, requireRole } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { body } = require("express-validator");

router.get("/me", auth, ctrl.getMe);
router.put(
  "/me",
  auth,
  [
    body("fullName").optional().trim().isLength({ max: 100 }),
    body("phone")
      .optional()
      .trim()
      .matches(/^[0-9+\-\s()]{7,20}$/)
      .withMessage("Invalid phone"),
  ],
  validate,
  ctrl.updateProfile,
);

router.get("/", auth, requireRole("system_admin"), ctrl.listUsers);
router.get("/:id", auth, requireRole("system_admin"), ctrl.getUserById);
router.patch(
  "/:id/block",
  auth,
  requireRole("system_admin"),
  [body("reason").trim().notEmpty().withMessage("Block reason is required")],
  validate,
  ctrl.blockUser,
);
router.patch(
  "/:id/unblock",
  auth,
  requireRole("system_admin"),
  ctrl.unblockUser,
);

module.exports = router;
