'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, X, Rocket, Building2, Users, LayoutDashboard } from 'lucide-react';
import { useOnboarding } from '@/lib/hooks/useOnboarding';

export function SetupChecklist() {
  const router = useRouter();
  const { progress, dismissOnboarding, completedSteps, totalSteps, progressPercentage, shouldShow } = useOnboarding();

  if (!shouldShow) return null;

  const steps = [
    {
      id: 'branch',
      title: 'Create your first branch',
      description: 'Set up a location for your tuition center',
      completed: progress.hasCreatedBranch,
      icon: Building2,
      action: () => router.push('/branches'),
    },
    {
      id: 'user',
      title: 'Add users',
      description: 'Invite teachers, students, or admins',
      completed: progress.hasCreatedUser,
      icon: Users,
      action: () => router.push('/users'),
    },
    {
      id: 'dashboard',
      title: 'Explore the dashboard',
      description: 'Get familiar with your system overview',
      completed: progress.hasViewedDashboard,
      icon: LayoutDashboard,
      action: () => router.push('/dashboard'),
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Rocket className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Get Started with Noesis</h3>
            <p className="text-sm text-slate-600 mt-0.5">
              Complete these steps to set up your system
            </p>
          </div>
        </div>
        <button
          onClick={dismissOnboarding}
          className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
          title="Dismiss"
        >
          <X size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-semibold text-slate-700">
            {completedSteps} of {totalSteps} completed
          </span>
          <span className="font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                step.completed
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-white border border-slate-200 hover:border-blue-300 cursor-pointer'
              }`}
              onClick={!step.completed ? step.action : undefined}
            >
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle2 className="text-green-600" size={24} />
                ) : (
                  <Circle className="text-slate-400" size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon size={16} className={step.completed ? 'text-green-600' : 'text-blue-600'} />
                  <h4 className={`font-semibold ${step.completed ? 'text-green-900' : 'text-slate-900'}`}>
                    {step.title}
                  </h4>
                </div>
                <p className={`text-sm ${step.completed ? 'text-green-700' : 'text-slate-600'}`}>
                  {step.description}
                </p>
              </div>
              {!step.completed && (
                <div className="flex-shrink-0">
                  <button
                    onClick={step.action}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Start
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
