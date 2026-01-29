/**
 * Session timeout warning modal
 * Displays when user session is about to expire
 */

import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  remainingSeconds: number;
  onContinue: () => void;
  onLogout: () => void;
}

export function SessionTimeoutWarning({
  isOpen,
  remainingSeconds,
  onContinue,
  onLogout,
}: SessionTimeoutWarningProps) {
  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = minutes > 0
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : `${seconds}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="text-amber-600" size={24} />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Session Expiring Soon
            </h3>
            <p className="text-slate-600 mb-1">
              Your session will expire due to inactivity in:
            </p>
            <p className="text-3xl font-bold text-amber-600 mb-4">
              {timeDisplay}
            </p>
            <p className="text-sm text-slate-500">
              Click "Continue Session" to stay logged in, or you will be automatically logged out.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={onContinue}
            className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200"
          >
            Continue Session
          </Button>
          <Button
            onClick={onLogout}
            variant="outline"
            className="h-11 px-6 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-semibold rounded-xl"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
