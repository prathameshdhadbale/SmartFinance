import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Otp from '../models/Otp.js';
import sgMail from '@sendgrid/mail';

const makeOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendEmail = async ({ to, subject, text }) => {
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      to,
      from: process.env.SMTP_FROM,
      subject,
      text,
      html: `<p>${text}</p>`,
    });
  } else {
    // Development fallback if no SendGrid key
    // eslint-disable-next-line no-console
    console.log(`Sending email to ${to}: ${subject}\n${text}`);
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email, purpose = 'signup' } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const otp = makeOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + (Number(process.env.OTP_EXPIRE_MINUTES || 10) * 60 * 1000));

    // Remove existing otps for same email+purpose
    await Otp.deleteMany({ email, purpose });

    await Otp.create({ email, purpose, otpHash, expiresAt });

    await sendEmail({
      to: email,
      subject: 'Your verification code',
      text: `Your verification code is: ${otp}. It expires in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes.`,
    });

    return res.json({ message: 'OTP sent' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to send OTP', error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose = 'signup' } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const record = await Otp.findOne({ email, purpose });
    if (!record) return res.status(400).json({ message: 'No OTP request found' });

    if (record.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });

    const match = await bcrypt.compare(String(otp), record.otpHash);
    if (!match) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    record.verified = true;
    await record.save();

    return res.json({ message: 'OTP verified' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to verify OTP', error: err.message });
  }
};

export const verifyAndReset = async (req, res) => {
  // For forgot password reset: expects { email, otp, password }
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) return res.status(400).json({ message: 'Email, OTP and password are required' });

    const record = await Otp.findOne({ email, purpose: 'forgot' });
    if (!record) return res.status(400).json({ message: 'No OTP request found' });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });

    const match = await bcrypt.compare(String(otp), record.otpHash);
    if (!match) return res.status(400).json({ message: 'Invalid OTP' });

    // mark verified and respond; actual password reset handled in authController.resetPassword
    record.verified = true;
    await record.save();
    return res.json({ message: 'OTP verified' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed', error: err.message });
  }
};
