import { ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  subtitle?: string;
}

export function AuthLayout({ children, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 blur-3xl"></div>

      <div className="w-full max-w-md lg:max-w-2xl space-y-5 relative z-10">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-200 mb-1">
            <GraduationCap className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Noesis</h1>
          {subtitle && (
            <p className="text-sm text-slate-600 font-medium">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
