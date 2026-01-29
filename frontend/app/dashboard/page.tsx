'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, User } from '@/lib/api';
import { Calendar, IdCard, Plane, FolderOpen } from 'lucide-react';
import { Sidebar, Header, StatCard, ManagementTile, SystemStatus } from '@/components/dashboard';
import { SessionTimeoutWarning } from '@/components/SessionTimeoutWarning';
import { useSessionTimeout } from '@/lib/hooks/useSessionTimeout';
import { logAuditEvent, AuditEventType, AuditSeverity } from '@/lib/auditLogger';
import { SetupChecklist } from '@/components/onboarding/SetupChecklist';
import { useOnboarding } from '@/lib/hooks/useOnboarding';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { markDashboardViewed } = useOnboarding();

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is authenticated
      const isAuth = await authApi.isAuthenticated();
      if (!isAuth) {
        router.push('/login');
        return;
      }

      // Get user info
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);

      // Mark dashboard as viewed for onboarding
      markDashboardViewed();
    };

    checkAuth();

    // Update time every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [router]);

  const handleLogout = async () => {
    await authApi.logout();
    router.push('/login');
  };

  // Session timeout with auto-logout
  const sessionTimeout = useSessionTimeout({
    onTimeout: async () => {
      // Log session timeout event
      logAuditEvent(
        AuditEventType.SESSION_TIMEOUT,
        AuditSeverity.WARNING,
        `Session timed out for ${user?.email || 'unknown user'}`,
        { email: user?.email }
      );

      await authApi.logout();
      router.push('/login?reason=timeout');
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <>
      <SessionTimeoutWarning
        isOpen={sessionTimeout.isWarning}
        remainingSeconds={sessionTimeout.remainingSeconds}
        onContinue={sessionTimeout.dismissWarning}
        onLogout={handleLogout}
      />

      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          userName={user.name}
          userRole={user.role.replace('_', ' ')}
          userInitials={getInitials(user.name)}
        />

      <div className="flex-1 flex flex-col">
        <Header onLogout={handleLogout} title="Dashboard Overview" />

        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10">
          {/* Hero Stats Section */}
          <section>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  System Console
                </h3>
                <p className="text-slate-500 mt-1 font-medium">
                  Welcome back, {user.name}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                <Calendar size={14} />
                <span>{formatDate(currentTime)}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <StatCard
                label="Total Students"
                value="1,284"
                trend={{ value: '+4%', positive: true }}
              />
              <StatCard label="Active Teachers" value="42" />
              <StatCard
                label="Leaves Pending"
                value="08"
                icon={<span className="text-rose-300">⚠</span>}
              />
              <StatCard label="Current Revenue" value="$24.5k" />
            </div>
          </section>

          {/* Onboarding Checklist */}
          <SetupChecklist />

          {/* Management Tiles */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <ManagementTile
              title="Users"
              description="Centralized identity management for teachers and students."
              icon={IdCard}
              iconColor="text-white"
              iconBgColor="bg-primary"
              badgeColor="text-primary"
              badgeBgColor="bg-blue-50"
              accentColor="blue"
            />

            <ManagementTile
              title="Leaves"
              description="Automated approval workflows and leave balance tracking."
              icon={Plane}
              iconColor="text-white"
              iconBgColor="bg-indigo-600"
              badgeColor="text-indigo-600"
              badgeBgColor="bg-indigo-50"
              accentColor="indigo"
            />

            <ManagementTile
              title="Library"
              description="Secure cloud storage for curriculum and financial reports."
              icon={FolderOpen}
              iconColor="text-white"
              iconBgColor="bg-emerald-600"
              badgeColor="text-emerald-600"
              badgeBgColor="bg-emerald-50"
              accentColor="emerald"
            />
          </section>

          {/* Server Status Dashboard */}
          <SystemStatus currentTime={formatTime(currentTime)} />
        </main>
      </div>
    </div>
    </>
  );
}
