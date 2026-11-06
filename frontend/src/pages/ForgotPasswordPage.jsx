import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

export const ForgotPasswordPage = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success('Password reset link sent to your email.');
    }, 600);
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
          Reset your password
        </h2>
        <p className="text-xs text-warm-500">
          Enter your registered work email and we'll send you recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-warm-200 shadow-warm-md space-y-5">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Work Email"
                type="email"
                leftIcon={Mail}
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                Send Recovery Link
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-base text-warm-900">Check your inbox</h4>
                <p className="text-xs text-warm-500">
                  We've sent a password reset link to <strong className="text-warm-800">{email}</strong>.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsSubmitted(false)}
                className="w-full"
              >
                Try another email
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
