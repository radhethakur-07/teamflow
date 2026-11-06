import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import authService from '../services/authService.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState('request'); // 'request' | 'reset' | 'completed'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setFormError('');

    try {
      const res = await authService.forgotPassword({ email });
      if (res?.devOtp) {
        setDevOtpHint(res.devOtp);
      }
      toast.success('Password recovery instructions dispatched.');
      setStep('reset');
    } catch (err) {
      setFormError(err.message || 'Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!otp || otp.length !== 6) {
      setFormError('Please enter the 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setFormError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        email,
        otp,
        newPassword,
      });

      toast.success('Password successfully reset! You can now log in.');
      setStep('completed');
    } catch (err) {
      setFormError(err.message || 'Invalid or expired recovery code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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
          {step === 'request'
            ? 'Reset your password'
            : step === 'reset'
            ? 'Enter recovery code'
            : 'Password Updated'}
        </h2>
        <p className="text-xs text-warm-500">
          {step === 'request'
            ? "Enter your registered work email and we'll send you recovery instructions."
            : step === 'reset'
            ? `Enter the 6-digit code sent to ${email} and choose a new password.`
            : 'Your account is secured with your new password.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-warm-200 shadow-warm-md space-y-5">
          {formError && (
            <div className="p-3.5 rounded-xl bg-terracotta-50 border border-terracotta-200 flex items-start gap-2.5 text-xs text-terracotta-800">
              <AlertCircle className="w-4 h-4 text-terracotta-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{formError}</div>
            </div>
          )}

          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <Input
                label="Work Email"
                type="email"
                leftIcon={Mail}
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError('');
                }}
                required
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full"
              >
                Send Recovery Code
              </Button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
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
                label="6-Digit Recovery Code"
                type="text"
                placeholder="123456"
                maxLength={6}
                leftIcon={KeyRound}
                value={otp}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(cleaned);
                  if (formError) setFormError('');
                }}
                className="font-mono tracking-widest text-base font-bold"
                required
                autoFocus
              />

              <Input
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                leftIcon={Lock}
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (formError) setFormError('');
                }}
                rightElement={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-warm-400 hover:text-warm-600 transition-colors focus:outline-none p-1"
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

              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                leftIcon={Lock}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formError) setFormError('');
                }}
                rightElement={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-warm-400 hover:text-warm-600 transition-colors focus:outline-none p-1"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full"
              >
                Reset Password
              </Button>
            </form>
          )}

          {step === 'completed' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-base text-warm-900">
                  Password Updated!
                </h4>
                <p className="text-xs text-warm-500">
                  Your password has been securely reset. You can now log in to your workspace.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Sign In to Workspace
              </Button>
            </div>
          )}

          <div className="text-center pt-2 border-t border-warm-100">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-warm-600 hover:text-terracotta-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
