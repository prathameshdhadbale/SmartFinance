import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Require a recent verified OTP for signup
    const otpRecord = await Otp.findOne({ email, purpose: 'signup', verified: true }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Email not verified. Complete OTP verification before signup.' });
    }
    // optional: ensure OTP verification is recent (within 1 hour)
    if (otpRecord.createdAt < new Date(Date.now() - (1000 * 60 * 60))) {
      return res.status(400).json({ message: 'OTP verification too old. Please verify again.' });
    }

    // Create user
    const user = new User({ name, email, password });
    await user.save();

    // cleanup OTP records for signup purpose
    await Otp.deleteMany({ email, purpose: 'signup' });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) return res.status(400).json({ message: 'Email, OTP and new password are required' });

    const record = await Otp.findOne({ email, purpose: 'forgot' }).sort({ createdAt: -1 });
    if (!record) return res.status(400).json({ message: 'No OTP request found' });
    if (record.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });

    // Compare OTP
    const bcrypt = await import('bcryptjs');
    const match = await bcrypt.default.compare(String(otp), record.otpHash);
    if (!match) return res.status(400).json({ message: 'Invalid OTP' });

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = password;
    await user.save();

    // remove otp records for this purpose
    await Otp.deleteMany({ email, purpose: 'forgot' });

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
};
