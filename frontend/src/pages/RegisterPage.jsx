import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { Checkbox } from '../components/common/Checkbox.jsx';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { register, verifyEmail, resendVerification } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState({});

  // Verification Step State
  const [step, setStep] = useState('form'); // 'form' | 'verify'
  const [otp, setOtp] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const calculatePasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Work email is required';
    if (!password || password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    if (!agreeTerms) newErrors.terms = 'Please accept the terms to proceed';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setFormError('');
    setErrors({});

    try {
      const res = await register({ name, email, password });
      toast.success('Account created! A verification code was sent to your email.');

      if (res?.devVerificationOtp) {
        setDevOtpHint(res.devVerificationOtp);
      }

      setStep('verify');
      setResendCooldown(30);
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setFormError('Please enter a valid 6-digit code.');
      return;
    }

    setIsLoading(true);
    setFormError('');

    try {
      await verifyEmail({ email, otp });
      toast.success('Email confirmed! Welcome to your TeamFlow workspace.');
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    setFormError('');

    try {
      const res = await resendVerification({ email });
      if (res?.devVerificationOtp) {
        setDevOtpHint(res.devVerificationOtp);
      }
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
      {/* Brand Header */}
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
          {step === 'form' ? 'Create your free workspace' : 'Confirm your email'}
        </h2>
        <p className="text-xs text-warm-500">
          {step === 'form'
            ? 'Get started in under 60 seconds. No credit card required.'
            : `We sent a 6-digit verification code to ${email}`}
        </p>
      </div>

      {/* Register Form / OTP Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-warm-200 shadow-warm-md space-y-5">
          {/* Error Alert */}
          {formError && (
            <div className="p-3.5 rounded-xl bg-terracotta-50 border border-terracotta-200 flex items-start gap-2.5 text-xs text-terracotta-800">
              <AlertCircle className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{formError}</div>
            </div>
          )}

          {step === 'form' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                leftIcon={User}
                placeholder="e.g. Maya Lin"
                value={name}
                error={errors.name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formError) setFormError('');
                }}
                required
                autoFocus
              />

              <Input
                label="Work Email"
                type="email"
                leftIcon={Mail}
                placeholder="maya@studio.com"
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError('');
                }}
                required
              />

              <div className="space-y-1.5">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  leftIcon={Lock}
                  placeholder="At least 8 characters"
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
                />

                {password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-warm-500">
                      <span>Password Strength</span>
                      <span className="font-bold text-warm-800">
                        {strength >= 100
                          ? 'Strong'
                          : strength >= 50
                          ? 'Good'
                          : 'Weak'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          strength >= 100
                            ? 'bg-sage-500'
                            : strength >= 50
                            ? 'bg-mustard-500'
                            : 'bg-terracotta-500'
                        }`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Checkbox
                label="I agree to the Terms of Service & Privacy Policy"
                checked={agreeTerms}
                onChange={setAgreeTerms}
              />
              {errors.terms && (
                <p className="text-xs text-terracotta-600 font-medium">
                  {errors.terms}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full"
                rightIcon={ArrowRight}
              >
                Create Workspace & Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center pb-2">
                <div className="w-12 h-12 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-6 h-6 text-sage-600" />
                </div>
                <p className="text-xs text-warm-600">
                  Please enter the 6-digit confirmation code we sent to{' '}
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
                    <Sparkles className="w-3.5 h-3.5 text-sage-600" />
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
                Verify & Enter Workspace
              </Button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="text-warm-500 hover:text-warm-700 underline"
                >
                  Skip for now
                </button>

                <button
                  type="button"
                  onClick={handleResend}
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
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-terracotta-600 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
