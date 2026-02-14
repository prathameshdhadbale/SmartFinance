import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api/client';

const Signup = () => {
  const [step, setStep] = useState('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const { signup } = useAuth();
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
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error('Enter a valid email');
    setLoading(true);
    try {
      await api.post('auth/send-otp', { email });
      toast.success('OTP sent to email');
      setStep('verify');
      startTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (!otp) return toast.error('Enter OTP');
    setLoading(true);
    try {
      await api.post('auth/verify-otp', { email, otp });
      toast.success('Email verified');
      setStep('details');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e?.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      // backend should accept signup after verified email
      const result = await signup(name, email, password);
      if (result.success) {
        toast.success('Account created successfully!');
        navigate('/');
      } else {
        toast.error(result.message || 'Signup failed');
      }
    } catch (err) {
      toast.error('Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">SmartFinance</h1>
          <p className="text-gray-600">Start tracking your finances</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign Up</h2>

          {step === 'email' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
              <button onClick={sendOtp} disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send OTP'}</button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input className="input-field" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
              <div className="flex gap-2">
                <button onClick={verifyOtp} disabled={loading} className="btn-primary flex-1">Verify</button>
                <button onClick={() => { if (!timer) sendOtp(); }} disabled={loading || timer>0} className="btn-secondary">{timer>0 ? `Resend in ${timer}s` : 'Resend'}</button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating account...' : 'Sign Up'}</button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
