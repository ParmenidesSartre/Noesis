import { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="p-6 lg:p-7">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
            {title}
          </h2>
          <p className="text-sm text-slate-600">
            {description}
          </p>
        </div>

        {children}

        {footer && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
