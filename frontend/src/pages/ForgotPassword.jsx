import { useState } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  const startTimer = () => {
    setTimer(60);
    const iv = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(iv);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const sendOtp = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error('Enter a valid email');
      return;
    }
    setLoading(true);
    try {
      await api.post('auth/forgot/send-otp', { email });
      toast.success('OTP sent to your email');
      setStep('verify');
      startTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return toast.error('Enter OTP');
    setLoading(true);
    try {
      await api.post('auth/forgot/verify-otp', { email, otp });
      toast.success('OTP verified, set new password');
      setStep('reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    if (password.length < 6) return toast.error('Password must be at least 6 chars');
    setLoading(true);
    try {
      await api.post('auth/forgot/reset', { email, otp, password });
      toast.success('Password reset successful');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary-600">Forgot Password</h1>
          <p className="text-gray-600">Reset your account password</p>
        </div>

        <div className="card">
          {step === 'email' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
              <button onClick={sendOtp} disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send OTP'}</button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
              <input className="input-field" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
              <div className="flex gap-2">
                <button onClick={verifyOtp} disabled={loading} className="btn-primary flex-1">Verify</button>
                <button onClick={() => { if (!timer) sendOtp(); }} disabled={loading || timer>0} className="btn-secondary">{timer>0 ? `Resend in ${timer}s` : 'Resend'}</button>
              </div>
            </div>
          )}

          {step === 'reset' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
              <button onClick={reset} disabled={loading} className="btn-primary w-full">{loading ? 'Saving...' : 'Set Password'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
