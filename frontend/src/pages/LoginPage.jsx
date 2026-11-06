import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { Checkbox } from '../components/common/Checkbox.jsx';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { login, verifyLoginOtp } = useAuth();

  const [email, setEmail] = useState('alice@teamflow.app');
  const [password, setPassword] = useState('SecurePassword123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState({});

  // OTP Step State
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim()) newErrors.email = 'Work email address is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setFormError('');
    setErrors({});

    try {
      const res = await login({ email, password });

      if (res?.requireOtp) {
        setStep('otp');
        setDevOtpHint(res.devOtp || '');
        setResendCooldown(30);
        toast.info('Please enter the 6-digit verification code sent to your email.');
        return;
      }

      toast.success(`Welcome back! Loading your workspace...`);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setFormError('Please enter a valid 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setFormError('');

    try {
      await verifyLoginOtp({ email, otp });
      toast.success('Identity verified! Entering workspace...');
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setFormError('');

    try {
      const res = await login({ email, password });
      if (res?.devOtp) setDevOtpHint(res.devOtp);
      setResendCooldown(30);
      toast.success('A new verification code has been dispatched.');
    } catch (err) {
      setFormError(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand mark */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-terracotta-500 text-white flex items-center justify-center font-heading font-bold text-lg shadow-warm-sm">
            TF
          </div>
          <span className="font-heading font-extrabold text-2xl text-warm-900 tracking-tight">
            TeamFlow
          </span>
        </Link>
        <h2 className="text-xl font-heading font-bold text-warm-900 tracking-tight pt-2">
          {step === 'credentials'
            ? 'Sign in to your workspace'
            : 'Two-Factor Authentication'}
        </h2>
        <p className="text-xs text-warm-500">
          {step === 'credentials'
            ? 'Enter your team credentials to access your projects and boards.'
            : `Enter the 6-digit code sent to ${email}`}
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-warm-200 shadow-warm-md space-y-6">
          {/* Error Banner */}
          {formError && (
            <div className="p-3.5 rounded-xl bg-terracotta-50 border border-terracotta-200 flex items-start gap-2.5 text-xs text-terracotta-800">
              <AlertCircle className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{formError}</div>
            </div>
          )}

          {step === 'credentials' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Work Email"
                type="email"
                leftIcon={Mail}
                placeholder="alice@teamflow.app"
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError('');
                }}
                required
                autoComplete="email"
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                leftIcon={Lock}
                placeholder="••••••••••••"
                value={password}
                error={errors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError('');
                }}
                rightElement={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-warm-400 hover:text-warm-600 transition-colors focus:outline-none p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                required
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between text-xs">
                <Checkbox
                  label="Remember me"
                  checked={rememberMe}
                  onChange={setRememberMe}
                />
                <Link
                  to="/forgot-password"
                  className="font-medium text-terracotta-600 hover:text-terracotta-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full"
                rightIcon={ArrowRight}
              >
                Sign In to Workspace
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-xl bg-warm-100 text-warm-700 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6 text-terracotta-600" />
                </div>
                <p className="text-xs text-warm-600">
                  A verification code has been dispatched to{' '}
                  <strong className="text-warm-900">{email}</strong>.
                </p>
              </div>

              {devOtpHint && (
                <div
                  onClick={() => setOtp(devOtpHint)}
                  className="p-3 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-800 cursor-pointer hover:bg-sage-100 transition-colors flex items-center justify-between"
                  title="Click to paste code into input"
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                    <span>Dev/Test Code:</span>
                    <strong className="font-mono text-sm tracking-widest text-sage-900">
                      {devOtpHint}
                    </strong>
                  </div>
                  <span className="text-[10px] text-sage-600 uppercase font-semibold">
                    Auto-Fill
                  </span>
                </div>
              )}

              <Input
                label="6-Digit Verification Code"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(cleaned);
                  if (formError) setFormError('');
                }}
                className="font-mono text-center tracking-[0.3em] text-lg font-bold"
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                disabled={otp.length !== 6}
                className="w-full"
              >
                Verify & Continue
              </Button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('credentials');
                    setFormError('');
                  }}
                  className="inline-flex items-center gap-1 font-medium text-warm-600 hover:text-warm-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className="inline-flex items-center gap-1 font-semibold text-terracotta-600 hover:text-terracotta-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Code'}
                  </span>
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-warm-500 pt-2 border-t border-warm-100">
            Don't have a workspace yet?{' '}
            <Link
              to="/register"
              className="font-bold text-terracotta-600 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
