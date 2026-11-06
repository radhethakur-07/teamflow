import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { Checkbox } from '../components/common/Checkbox.jsx';

export const LoginPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('jane@teamflow.app');
  const [password, setPassword] = useState('Password123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim()) newErrors.email = 'Email address is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Simulated login in UI preview milestone
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Welcome back, Jane Doe! Loading your workspace...`);
      navigate('/dashboard');
    }, 700);
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
          Sign in to your workspace
        </h2>
        <p className="text-xs text-warm-500">
          Enter your team credentials to access your projects and boards.
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-warm-200 shadow-warm-md space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              leftIcon={Mail}
              placeholder="jane@company.com"
              value={email}
              error={errors.email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              leftIcon={Lock}
              placeholder="••••••••••••"
              value={password}
              error={errors.password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

          {/* Quick Demo Credentials */}
          <div className="p-3 rounded-xl bg-warm-100/70 border border-warm-200 text-xs text-warm-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-warm-800">
              <Sparkles className="w-3.5 h-3.5 text-mustard-500" />
              <span>Interactive UI Preview</span>
            </div>
            <p className="text-[11px] text-warm-500">
              Credentials pre-filled for demo. Clicking "Sign In" launches the full workspace interface.
            </p>
          </div>

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
