import { Server } from 'lucide-react';

interface SystemStatusProps {
  currentTime: string;
}

export function SystemStatus({ currentTime }: SystemStatusProps) {
  return (
    <section className="bg-slate-900 rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] -mr-48 -mt-48"></div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Server className="text-blue-400" size={24} />
            </div>
            <div>
              <h4 className="text-xl font-extrabold tracking-tight">System Infrastructure</h4>
              <p className="text-slate-400 text-xs font-semibold tracking-wide">
                DOCKER-COMPOSE: DEV-ENV
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
            <span className="flex h-2 w-2 rounded-full bg-green-400">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider">
              All Systems Nominal
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="space-y-6">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">
              Services
            </p>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                <div>
                  <p className="text-sm font-bold">API Gateway</p>
                  <p className="text-[10px] text-slate-500 font-mono">200 OK | Port 3001</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                <div>
                  <p className="text-sm font-bold">PostgreSQL DB</p>
                  <p className="text-[10px] text-slate-500 font-mono">Connected | Docker</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em]">
              Build Queue
            </p>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                <div>
                  <p className="text-sm font-bold text-slate-300 italic">User UI Module</p>
                  <p className="text-[10px] text-slate-500 font-mono">In Progress</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                <div>
                  <p className="text-sm font-bold text-slate-300 italic">Leave UI</p>
                  <p className="text-[10px] text-slate-500 font-mono">Queued</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 hidden lg:block">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Environment
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex justify-between text-[10px] mb-2">
                <span className="text-slate-400 font-bold uppercase">Frontend</span>
                <span className="text-blue-400 font-mono">Next.js 14</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-blue-500 w-full"></div>
              </div>
              <div className="flex justify-between text-[10px] mb-2">
                <span className="text-slate-400 font-bold uppercase">Backend</span>
                <span className="text-indigo-400 font-mono">NestJS</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">
          Powered by Noesis Core v1.0.0
        </p>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-2">⏱ SYS_TIME: {currentTime}</span>
        </div>
      </div>
    </section>
  );
}
