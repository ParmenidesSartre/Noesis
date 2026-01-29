/**
 * Password strength indicator component
 * Provides visual feedback on password strength
 */

import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

interface StrengthCriteria {
  label: string;
  met: boolean;
}

interface StrengthResult {
  score: number; // 0-4
  criteria: StrengthCriteria[];
  strengthLabel: string;
  strengthColor: string;
}

function calculatePasswordStrength(password: string): StrengthResult {
  const criteria: StrengthCriteria[] = [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Contains number',
      met: /\d/.test(password),
    },
    {
      label: 'Contains special character',
      met: /[^\w\s]/.test(password),
    },
  ];

  const metCount = criteria.filter((c) => c.met).length;

  let strengthLabel: string;
  let strengthColor: string;
  let score: number;

  if (password.length === 0) {
    strengthLabel = '';
    strengthColor = 'bg-slate-200';
    score = 0;
  } else if (metCount <= 2) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-rose-500';
    score = 1;
  } else if (metCount === 3) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-amber-500';
    score = 2;
  } else if (metCount === 4) {
    strengthLabel = 'Good';
    strengthColor = 'bg-blue-500';
    score = 3;
  } else {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    score = 4;
  }

  return { score, criteria, strengthLabel, strengthColor };
}

export function PasswordStrengthIndicator({
  password,
  className = '',
}: PasswordStrengthIndicatorProps) {
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">Password Strength</span>
          {strength.strengthLabel && (
            <span
              className={`text-xs font-bold ${
                strength.score === 1
                  ? 'text-rose-600'
                  : strength.score === 2
                  ? 'text-amber-600'
                  : strength.score === 3
                  ? 'text-blue-600'
                  : 'text-emerald-600'
              }`}
            >
              {strength.strengthLabel}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                level <= strength.score ? strength.strengthColor : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Criteria checklist */}
      <div className="space-y-1.5">
        {strength.criteria.map((criterion, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {criterion.met ? (
              <Check className="text-emerald-600 flex-shrink-0" size={14} />
            ) : (
              <X className="text-slate-400 flex-shrink-0" size={14} />
            )}
            <span
              className={`${
                criterion.met ? 'text-emerald-700 font-medium' : 'text-slate-500'
              }`}
            >
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
