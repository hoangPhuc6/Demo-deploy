const nodemailer = require("nodemailer");

const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "gmail";
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const EMAIL_FROM =
  process.env.EMAIL_FROM || process.env.EMAIL_USER || "no-reply@clms.local";
const OTP_TTL_MINUTES = parseInt(process.env.OTP_TTL_MINUTES, 10) || 10;

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!EMAIL_USER || !EMAIL_PASS) {
    return {
      sendMail: async (opts) => {
        console.log(
          "[EMAIL DISABLED] Would send:",
          opts.subject,
          "->",
          opts.to,
        );
        return { messageId: "stub" };
      },
    };
  }
  transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
};

const sendEmail = async (to, subject, html) => {
  try {
    await getTransporter().sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[Email send error]", err.message);
  }
};

const sendVerificationOtp = (email, otp) => {
  return sendEmail(
    email,
    "CLMS - Email verification code",
    `<h2>Welcome to CLMS</h2>
     <p>Your verification code is:</p>
     <h1 style="letter-spacing:4px;">${otp}</h1>
     <p>This code expires in ${OTP_TTL_MINUTES} minutes.</p>`,
  );
};

const sendPasswordResetOtp = (email, otp) => {
  return sendEmail(
    email,
    "CLMS - Password reset code",
    `<h2>Password reset</h2>
     <p>Your password reset code is:</p>
     <h1 style="letter-spacing:4px;">${otp}</h1>
     <p>This code expires in ${OTP_TTL_MINUTES} minutes.</p>`,
  );
};

module.exports = { sendEmail, sendVerificationOtp, sendPasswordResetOtp };
