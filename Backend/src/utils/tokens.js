const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const signAccessToken = (payload) =>
  jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });

const signRefreshToken = (payload) =>
  jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

const verifyAccessToken = (token) => jwt.verify(token, JWT_ACCESS_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, JWT_REFRESH_SECRET);

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const parseDuration = (str) => {
  if (typeof str !== "string") return 0;
  const m = str.match(/^(\d+)\s*([smhd])$/i);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return n * mult[unit];
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  parseDuration,
};
