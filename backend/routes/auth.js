import express from 'express';
import { signup, login } from '../controllers/authController.js';
import { sendOtp, verifyOtp, verifyAndReset } from '../controllers/otpController.js';
import { resetPassword } from '../controllers/authController.js';

const router = express.Router();

// Signup/Login
router.post('/signup', signup);
router.post('/login', login);

// OTP endpoints
router.post('/send-otp', sendOtp); // body: { email, purpose }
router.post('/verify-otp', verifyOtp); // body: { email, otp, purpose }

// Forgot password flow
router.post('/forgot/send-otp', sendOtp);
router.post('/forgot/verify-otp', verifyOtp);
router.post('/forgot/reset', resetPassword);

export default router;
