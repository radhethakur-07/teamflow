import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User, Check, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import { Checkbox } from '../components/common/Checkbox.jsx';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleRegister = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Work email is required';
    if (!password || password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!agreeTerms) newErrors.terms = 'Please accept the terms to proceed';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Account registered! Setting up your workspace...`);
      navigate('/onboarding');
    }, 700);
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
          Create your free workspace
        </h2>
        <p className="text-xs text-warm-500">
          Get started in under 60 seconds. No credit card required.
        </p>
      </div>

      {/* Register Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-warm-200 shadow-warm-md space-y-5">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              leftIcon={User}
              placeholder="e.g. Jane Doe"
              value={name}
              error={errors.name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />

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

            <div className="space-y-1.5">
              <Input
                label="Password"
                type="password"
                leftIcon={Lock}
                placeholder="At least 8 characters"
                value={password}
                error={errors.password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-warm-500">
                    <span>Password Strength</span>
                    <span className="font-bold text-warm-800">
                      {strength >= 100 ? 'Strong' : strength >= 50 ? 'Good' : 'Weak'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-warm-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        strength >= 100 ? 'bg-sage-500' : strength >= 50 ? 'bg-mustard-500' : 'bg-terracotta-500'
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
              <p className="text-xs text-terracotta-600 font-medium">{errors.terms}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full"
              rightIcon={ArrowRight}
            >
              Continue to Workspace Setup
            </Button>
          </form>

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
