'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import { AuthLayout, AuthCard, FormField, FormError, AuthFooter } from '@/components/auth';
import { useRateLimit } from '@/lib/hooks/useRateLimit';
import { detectDeviceChange, storeFingerprint } from '@/lib/fingerprint';
import { logAuditEvent, AuditEventType, AuditSeverity } from '@/lib/auditLogger';
import { isUserLockedOut, recordFailedLogin, clearFailedAttempts } from '@/lib/failedLoginTracker';
import { LogIn, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<Array<{ slug: string; name: string }>>([]);
  const [infoMessage, setInfoMessage] = useState('');

  // Rate limiting
  const rateLimit = useRateLimit('login');

  // Check for logout reason
  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'timeout') {
      setInfoMessage('Your session expired due to inactivity. Please sign in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if user account is locked due to failed attempts
    const lockStatus = isUserLockedOut(email);
    if (lockStatus.locked) {
      setError(lockStatus.message || 'Account locked. Please try again later.');
      return;
    }

    // Check rate limit before proceeding
    if (!rateLimit.checkRateLimit()) {
      setError(rateLimit.rateLimitMessage || 'Too many attempts. Please try again later.');
      return;
    }

    setLoading(true);

    try {
      // Check device fingerprint before login
      const deviceCheck = await detectDeviceChange();

      await authApi.login({
        email,
        password,
        organizationSlug: organizationSlug || undefined,
      });

      // Login successful - audit log and clear rate limit
      logAuditEvent(
        AuditEventType.LOGIN_SUCCESS,
        AuditSeverity.INFO,
        `Successful login for ${email}`,
        {
          email,
          deviceFingerprint: deviceCheck.currentFingerprint.hash,
          deviceChanged: deviceCheck.changed,
        }
      );

      // Store fingerprint for this session
      storeFingerprint(deviceCheck.currentFingerprint);

      // Clear failed login attempts for this user
      clearFailedAttempts(email);

      rateLimit.recordSuccess();
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.organizations) {
        // Multiple organizations found - this is not a failed login
        setOrganizations(err.response.data.organizations);
        setError('');
      } else {
        // Get device fingerprint for tracking
        const deviceCheck = await detectDeviceChange();

        // Failed login - audit log and record attempt
        logAuditEvent(
          AuditEventType.LOGIN_FAILURE,
          AuditSeverity.WARNING,
          `Failed login attempt for ${email}`,
          {
            email,
            reason: err.response?.data?.message || 'Invalid credentials',
          }
        );

        // Record failed login attempt per user
        recordFailedLogin(email, deviceCheck.currentFingerprint.hash);

        rateLimit.recordFailure();
        setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="Tuition Centre Management System">
      <AuthCard
        title="Welcome back"
        description="Sign in to your account to continue"
        footer={
          <div className="text-center text-sm">
            <span className="text-slate-600">Don&apos;t have an account? </span>
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Register your institution
            </Link>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormError message={error} />

          {infoMessage && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex-1 text-sm">
                <p className="text-blue-900 font-medium">{infoMessage}</p>
              </div>
            </div>
          )}

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

          {organizations.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="organization" className="text-sm font-semibold text-slate-700">
                Select Organization
              </Label>
              <select
                id="organization"
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={organizationSlug}
                onChange={(e) => setOrganizationSlug(e.target.value)}
                required
              >
                <option value="">Choose your organization</option>
                {organizations.map((org) => (
                  <option key={org.slug} value={org.slug}>
                    {org.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 font-medium">
                You have accounts in multiple organizations
              </p>
            </div>
          )}

          <FormField
            label="Email"
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <FormField
              label=""
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || rateLimit.isBlocked}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={18} />
                Sign in
              </span>
            )}
          </Button>
        </form>
      </AuthCard>

      <AuthFooter text="By signing in, you agree to our Terms of Service and Privacy Policy" />
    </AuthLayout>
  );
}
