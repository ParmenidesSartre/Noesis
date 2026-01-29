import { Bell, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onLogout: () => void;
  title?: string;
}

export function Header({ onLogout, title = 'Dashboard Overview' }: HeaderProps) {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 hidden sm:block">{title}</h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Notifications */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

        <Button
          onClick={onLogout}
          variant="outline"
          size="sm"
          className="bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 hover:text-rose-700"
        >
          <LogOut size={16} className="mr-2" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
