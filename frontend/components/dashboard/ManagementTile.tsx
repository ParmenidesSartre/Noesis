import { Card } from '@/components/ui/card';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ManagementTileProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  badgeColor: string;
  badgeBgColor: string;
  accentColor: string;
  status?: string;
  onClick?: () => void;
}

export function ManagementTile({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  badgeColor,
  badgeBgColor,
  accentColor,
  status = 'Coming Soon',
  onClick,
}: ManagementTileProps) {
  return (
    <Card
      className={`group relative p-8 border-slate-100 shadow-sm hover:shadow-xl hover:shadow-${accentColor}-500/5 transition-all duration-500 overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${accentColor}-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700`}></div>
      <div className="relative">
        <div className={`w-14 h-14 ${iconBgColor} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-${accentColor}-200`}>
          <Icon className={iconColor} size={24} />
        </div>
        <h4 className="text-xl font-bold text-slate-900">{title}</h4>
        <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed">
          {description}
        </p>
        <div className="mt-8 flex items-center justify-between">
          <span className={`text-[10px] font-bold ${badgeColor} uppercase ${badgeBgColor} px-3 py-1 rounded-full`}>
            {status}
          </span>
          <ArrowRight
            className={`text-slate-300 group-hover:text-${accentColor}-500 group-hover:translate-x-1 transition-all`}
            size={20}
          />
        </div>
      </div>
    </Card>
  );
}
