import env from "../config/env.js";

// In-memory OTP store (dev only — use Redis in production)
const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const DEV_OTP = "1234";

export const sendOtp = async (phone) => {
  let otp;

  if (env.nodeEnv === "development") {
    otp = DEV_OTP;
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
  } else {
    // TODO: Send OTP via Twilio in production
    otp = Math.floor(1000 + Math.random() * 9000).toString();
  }

  otpStore.set(phone, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });

  return true;
};

export const verifyOtp = (phone, otp) => {
  const record = otpStore.get(phone);

  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return false;
  }
  if (record.otp !== otp) return false;

  otpStore.delete(phone);
  return true;
};
