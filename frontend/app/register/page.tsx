'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';
import { AuthLayout, AuthCard, FormField, FormError, AuthFooter } from '@/components/auth';
import { validatePassword, validatePasswordMatch, validateEmail, sanitizeInput, sanitizeEmail } from '@/lib/validation';
import { useRateLimit } from '@/lib/hooks/useRateLimit';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { logAuditEvent, AuditEventType, AuditSeverity } from '@/lib/auditLogger';
import { UserPlus, ShieldAlert } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    organizationName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Rate limiting
  const rateLimit = useRateLimit('register');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check rate limit before proceeding
    if (!rateLimit.checkRateLimit()) {
      setError(rateLimit.rateLimitMessage || 'Too many attempts. Please try again later.');
      return;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error!);
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error!);
      return;
    }

    // Validate passwords match
    const passwordMatchValidation = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (!passwordMatchValidation.isValid) {
      setError(passwordMatchValidation.error!);
      return;
    }

    setLoading(true);

    try {
      // Sanitize inputs before sending
      const sanitizedData = {
        organizationName: sanitizeInput(formData.organizationName),
        organizationEmail: sanitizeEmail(formData.email),
        organizationPhone: formData.phone ? sanitizeInput(formData.phone) : undefined,
        adminName: sanitizeInput(`${formData.firstName} ${formData.lastName}`),
        adminEmail: sanitizeEmail(formData.email),
        adminPassword: formData.password, // Don't sanitize passwords
      };

      // Register the organization
      await authApi.register(sanitizedData);

      // Automatically log in with the credentials (organization auto-detected from email)
      await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      // Registration successful - audit log and clear rate limit
      logAuditEvent(
        AuditEventType.REGISTRATION_SUCCESS,
        AuditSeverity.INFO,
        `New organization registered: ${formData.organizationName}`,
        {
          organizationName: formData.organizationName,
          adminEmail: formData.email,
        }
      );

      rateLimit.recordSuccess();

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      // Failed registration - audit log and record attempt
      logAuditEvent(
        AuditEventType.REGISTRATION_FAILURE,
        AuditSeverity.WARNING,
        `Failed registration attempt for ${formData.email}`,
        {
          email: formData.email,
          reason: err.response?.data?.message || 'Unknown error',
        }
      );

      rateLimit.recordFailure();
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Start managing your tuition centre today">
      <AuthCard
        title="Register your institution"
        description="Create an account to start your 14-day free trial"
        footer={
          <div className="text-center text-sm">
            <span className="text-slate-600">Already have an account? </span>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormError message={error} />

          {rateLimit.isBlocked && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <ShieldAlert className="text-rose-600 flex-shrink-0 mt-0.5" size={18} />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-rose-900">Rate limit exceeded</p>
                <p className="text-rose-700 mt-1">
                  Please wait {rateLimit.retryAfter} seconds before trying again.
                </p>
              </div>
            </div>
          )}

          {/* Compact grid layout - no section headers */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                label="Institution Name"
                id="organizationName"
                name="organizationName"
                placeholder="ABC Tuition Centre"
                value={formData.organizationName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Email Address"
                id="email"
                name="email"
                type="email"
                placeholder="admin@abctuition.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                label="First Name"
                id="firstName"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Last Name"
                id="lastName"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <FormField
              label="Phone Number (optional)"
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={handleChange}
            />

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Str0ng!Pass"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <FormField
                  label="Confirm Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* Password strength indicator */}
              {formData.password && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <PasswordStrengthIndicator password={formData.password} />
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || rateLimit.isBlocked}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <UserPlus size={18} />
                Create account
              </span>
            )}
          </Button>
        </form>
      </AuthCard>

      <AuthFooter text="By registering, you agree to our Terms of Service and Privacy Policy" />
    </AuthLayout>
  );
}
