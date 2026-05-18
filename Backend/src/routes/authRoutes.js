const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/authController");
const { auth } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/rateLimit");
const {
  registerRules,
  loginRules,
  verifyEmailRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
} = require("../validators/authValidators");

router.post("/register", registerRules, validate, ctrl.register);
router.post(
  "/verify-email",
  authLimiter,
  verifyEmailRules,
  validate,
  ctrl.verifyEmail,
);
router.post(
  "/resend-verification",
  authLimiter,
  forgotPasswordRules,
  validate,
  ctrl.resendVerification,
);
router.post("/login", authLimiter, loginRules, validate, ctrl.login);
router.post("/refresh-token", ctrl.refreshToken);
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordRules,
  validate,
  ctrl.forgotPassword,
);
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordRules,
  validate,
  ctrl.resetPassword,
);

router.post("/logout", auth, ctrl.logout);
router.put(
  "/change-password",
  auth,
  changePasswordRules,
  validate,
  ctrl.changePassword,
);

module.exports = router;
