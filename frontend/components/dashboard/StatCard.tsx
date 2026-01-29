import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    positive?: boolean;
  };
  icon?: ReactNode;
}

export function StatCard({ label, value, trend, icon }: StatCardProps) {
  return (
    <Card className="p-5 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-black text-slate-900">{value}</span>
        {trend && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded mb-1 ${
              trend.positive
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-rose-600 bg-rose-50'
            }`}
          >
            {trend.value}
          </span>
        )}
        {icon && <span className="mb-1.5">{icon}</span>}
      </div>
    </Card>
  );
}
