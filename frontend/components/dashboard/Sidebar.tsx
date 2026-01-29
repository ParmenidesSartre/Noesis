'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, LayoutDashboard, Users, Calendar, DollarSign, Settings, Shield, Building2 } from 'lucide-react';

interface SidebarProps {
  userName: string;
  userRole: string;
  userInitials: string;
}

export function Sidebar({ userName, userRole, userInitials }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <GraduationCap className="text-white" size={20} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Noesis</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-8">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">
            Main Menu
          </p>
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-primary text-white shadow-lg shadow-blue-200'
                  : 'text-slate-500 hover:bg-blue-50 hover:text-primary'
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link
              href="/users"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                pathname === '/users'
                  ? 'bg-primary text-white shadow-lg shadow-blue-200'
                  : 'text-slate-500 hover:bg-blue-50 hover:text-primary'
              }`}
            >
              <Users size={18} />
              User Manager
            </Link>
            <Link
              href="/branches"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                pathname === '/branches'
                  ? 'bg-primary text-white shadow-lg shadow-blue-200'
                  : 'text-slate-500 hover:bg-blue-50 hover:text-primary'
              }`}
            >
              <Building2 size={18} />
              Branches
            </Link>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-blue-50 hover:text-primary transition-colors">
              <Calendar size={18} />
              Attendance
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-blue-50 hover:text-primary transition-colors">
              <DollarSign size={18} />
              Payments
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">
            Administration
          </p>
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-blue-50 hover:text-primary transition-colors">
              <Settings size={18} />
              Settings
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-blue-50 hover:text-primary transition-colors">
              <Shield size={18} />
              System Logs
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Card */}
      <div className="mt-auto pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center font-bold text-primary shadow-sm">
            {userInitials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-tight">
              {userRole}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
